import { ALGORITHMS } from './index.js';

/**
 * Times a function. One search on this grid takes well under a millisecond,
 * below the useful resolution of performance.now() in most browsers, so the
 * function is repeated until a minimum total time has passed and the average
 * is reported.
 */
export function timeIt(
  fn,
  { minTotalMs = 5, maxRuns = 200, warmup = 1, now = () => performance.now() } = {},
) {
  // Untimed warm-up calls, so the JavaScript engine's first-run compilation
  // doesn't make whichever algorithm is measured first look slower.
  for (let i = 0; i < warmup; i++) fn();

  let result;
  let runs = 0;
  const t0 = now();
  let elapsed = 0;
  do {
    result = fn();
    runs++;
    elapsed = now() - t0;
  } while (elapsed < minTotalMs && runs < maxRuns);
  return { result, ms: elapsed / runs, runs };
}

/**
 * Runs every algorithm on the same board.
 * @returns {{ algorithm: object, result: import('./path.js').SearchResult, ms: number }[]}
 */
export function runAll(grid, start, end, { algorithms = ALGORITHMS, timing } = {}) {
  return algorithms.map((algorithm) => {
    const { result, ms } = timeIt(() => algorithm.run(grid, start, end), timing);
    return { algorithm, result, ms };
  });
}

export function formatMs(ms) {
  if (ms < 0.01) return '<0.01 ms';
  if (ms < 10) return `${ms.toFixed(2)} ms`;
  return `${Math.round(ms)} ms`;
}

/** Rows of the comparison table. Lower is better for all of them. */
export const METRICS = [
  {
    id: 'visited',
    label: 'Cells visited',
    value: (e) => e.result.visitedInOrder.length,
  },
  {
    id: 'steps',
    label: 'Path length',
    unit: 'steps',
    value: (e) => (e.result.found ? e.result.steps : null),
  },
  {
    id: 'cost',
    label: 'Path cost',
    value: (e) => (e.result.found ? e.result.cost : null),
  },
  {
    id: 'ms',
    label: 'Runtime',
    value: (e) => e.ms,
    format: formatMs,
  },
];

/**
 * Ids of the entries with the best (lowest) value for a metric.
 * Returns an empty set on a tie between all entries or when nothing is
 * comparable, so the table only highlights a real winner.
 */
export function bestIds(entries, metric) {
  const scored = entries
    .map((e) => ({ id: e.algorithm.id, v: metric.value(e) }))
    .filter((s) => s.v !== null && s.v !== undefined);
  if (scored.length < 2) return new Set();
  const min = Math.min(...scored.map((s) => s.v));
  const winners = scored.filter((s) => s.v === min);
  if (winners.length === scored.length) return new Set();
  return new Set(winners.map((s) => s.id));
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** True if both results walk exactly the same cells. */
export function samePath(a, b) {
  if (a.path.length !== b.path.length) return false;
  return a.path.every((cell, i) => cell.row === b.path[i].row && cell.col === b.path[i].col);
}

/**
 * One plain-language sentence explaining the BFS vs Dijkstra outcome,
 * so the numbers in the table mean something to a visitor.
 */
export function describeComparison(entries, { hasWeights }) {
  const bfs = entries.find((e) => e.algorithm.id === 'bfs')?.result;
  const dijkstra = entries.find((e) => e.algorithm.id === 'dijkstra')?.result;
  if (!bfs || !dijkstra) return '';

  if (!bfs.found) {
    return 'There is no path between start and destination, so both algorithms explored every reachable cell before giving up.';
  }

  if (!hasWeights) {
    return `With no weights on the board every step costs 1, so both find the same ${bfs.steps}-step path. Dijkstra does the same job as BFS here, with the extra overhead of a priority queue.`;
  }

  if (dijkstra.cost < bfs.cost) {
    const saved = bfs.cost - dijkstra.cost;
    const extra = dijkstra.steps - bfs.steps;
    const how =
      extra > 0
        ? `by taking ${plural(extra, 'extra step')} around weighted cells`
        : 'with the same number of steps';
    return `Dijkstra's path costs ${saved} less than BFS's (${dijkstra.cost} vs ${bfs.cost}) ${how}. BFS only minimises steps, so it walked straight through the weights.`;
  }

  if (samePath(bfs, dijkstra)) {
    return `Both took the same ${bfs.steps}-step route (cost ${bfs.cost}): there was no cheaper detour around the weights on this board.`;
  }

  return `Both paths cost ${bfs.cost}, by different routes. Here BFS's fewest-steps route happens to be as cheap as the cheapest one, but on a weighted board that isn't guaranteed.`;
}
