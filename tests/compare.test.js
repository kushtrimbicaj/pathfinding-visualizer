import { describe, expect, it } from 'vitest';
import {
  METRICS,
  bestIds,
  describeComparison,
  formatMs,
  runAll,
  samePath,
  timeIt,
} from '../src/algorithms/compare.js';
import { parseGrid } from './helpers.js';

const metric = (id) => METRICS.find((m) => m.id === id);

describe('timeIt', () => {
  it('repeats until the minimum total time and averages', () => {
    let t = 0;
    const now = () => t;
    let calls = 0;
    const { ms, runs, result } = timeIt(
      () => {
        calls++;
        t += 0.5; // each call "takes" 0.5 ms
        return 'ok';
      },
      { minTotalMs: 5, warmup: 0, now },
    );
    expect(result).toBe('ok');
    expect(runs).toBe(10);
    expect(calls).toBe(10);
    expect(ms).toBe(0.5);
  });

  it('stops at maxRuns', () => {
    const { runs } = timeIt(() => 1, { minTotalMs: 1e9, maxRuns: 7, now: () => 0 });
    expect(runs).toBe(7);
  });

  it('makes untimed warm-up calls first', () => {
    let calls = 0;
    const { runs } = timeIt(() => calls++, { minTotalMs: 0, warmup: 3, now: () => 0 });
    expect(runs).toBe(1);
    expect(calls).toBe(4);
  });

  it('always runs at least once', () => {
    let t = 0;
    const { runs } = timeIt(() => (t += 100), { minTotalMs: 5, now: () => t });
    expect(runs).toBe(1);
  });
});

describe('formatMs', () => {
  it('formats small and large durations', () => {
    expect(formatMs(0.001)).toBe('<0.01 ms');
    expect(formatMs(0.1234)).toBe('0.12 ms');
    expect(formatMs(42.4)).toBe('42 ms');
  });
});

describe('runAll', () => {
  it('runs every algorithm on the same board', () => {
    const { grid, start, end } = parseGrid(['S.w.E']);
    const entries = runAll(grid, start, end, { timing: { minTotalMs: 0 } });
    expect(entries.map((e) => e.algorithm.id)).toEqual(['bfs', 'dijkstra']);
    for (const e of entries) {
      expect(e.result.found).toBe(true);
      expect(typeof e.ms).toBe('number');
    }
  });
});

describe('bestIds', () => {
  const fake = (id, visited, found = true, cost = 1) => ({
    algorithm: { id },
    result: { visitedInOrder: { length: visited }, found, steps: 1, cost },
    ms: 1,
  });

  it('picks the lowest value', () => {
    expect([...bestIds([fake('a', 10), fake('b', 20)], metric('visited'))]).toEqual(['a']);
  });

  it('highlights nothing on a full tie', () => {
    expect(bestIds([fake('a', 10), fake('b', 10)], metric('visited')).size).toBe(0);
  });

  it('ignores entries with no value (no path)', () => {
    expect(bestIds([fake('a', 1, false), fake('b', 1, true)], metric('cost')).size).toBe(0);
  });
});

describe('samePath', () => {
  it('compares paths cell by cell', () => {
    const a = { path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] };
    const b = { path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] };
    const c = { path: [{ row: 0, col: 0 }, { row: 1, col: 0 }] };
    expect(samePath(a, b)).toBe(true);
    expect(samePath(a, c)).toBe(false);
    expect(samePath(a, { path: [] })).toBe(false);
  });
});

describe('describeComparison', () => {
  const describeBoard = (lines) => {
    const { grid, start, end } = parseGrid(lines);
    const hasWeights = lines.some((l) => l.includes('w'));
    return describeComparison(runAll(grid, start, end, { timing: { minTotalMs: 0 } }), { hasWeights });
  };

  it('explains when there is no path', () => {
    expect(describeBoard(['S#E'])).toMatch(/no path/);
  });

  it('explains that both are equivalent without weights', () => {
    expect(describeBoard(['S...E'])).toMatch(/no weights.*4-step path/);
  });

  it('explains how much cheaper Dijkstra is and why', () => {
    const text = describeBoard(['.......', 'S.www.E', '.......']);
    expect(text).toMatch(/costs 10 less than BFS's \(8 vs 18\)/);
    expect(text).toMatch(/2 extra steps/);
  });

  it('explains when both take the same route on a weighted board', () => {
    expect(describeBoard(['S...E', 'wwwww'])).toMatch(/same 4-step route \(cost 4\)/);
  });

  it('explains an equal-cost result reached by different routes', () => {
    const cell = (row, col) => ({ row, col });
    const entry = (id, path) => ({
      algorithm: { id },
      result: { found: true, path, steps: 2, cost: 2, visitedInOrder: [] },
    });
    const entries = [
      entry('bfs', [cell(0, 0), cell(0, 1), cell(1, 1)]),
      entry('dijkstra', [cell(0, 0), cell(1, 0), cell(1, 1)]),
    ];
    expect(describeComparison(entries, { hasWeights: true })).toMatch(/Both paths cost 2, by different routes/);
  });
});
