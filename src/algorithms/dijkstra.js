import { getNeighbors, isOpen, keyOf } from '../grid/gridUtils.js';
import { NORMAL_WEIGHT } from '../grid/constants.js';
import { MinHeap } from './MinHeap.js';
import { buildResult, emptyResult } from './path.js';

// Heap entries: { cell, dist, seq }. Ties on distance are broken by insertion
// order (seq), so equal-cost cells come out first-in-first-out. That makes the
// search deterministic and, on an unweighted grid, expand in the same
// ring-by-ring order as BFS.
const byDistanceThenSeq = (a, b) => a.dist - b.dist || a.seq - b.seq;

/**
 * Dijkstra's algorithm.
 *
 * Always settles the unsettled cell with the smallest known distance next.
 * With non-negative weights, that distance can never improve later, so the
 * moment the end cell is settled its path is the CHEAPEST possible.
 *
 * Uses "lazy deletion" instead of a decrease-key operation: when a cell's
 * distance improves, a new entry is pushed and the old one is skipped when it
 * is popped. Simpler than an indexed heap, and still O((V + E) log V).
 *
 * @param {import('../grid/createGrid.js').Grid} grid
 * @param {{row:number,col:number}} start
 * @param {{row:number,col:number}} end
 * @returns {import('./path.js').SearchResult}
 */
export function dijkstra(grid, start, end) {
  if (!isOpen(grid, start) || !isOpen(grid, end)) return emptyResult();

  const startCell = grid[start.row][start.col];
  const endCell = grid[end.row][end.col];

  const visitedInOrder = [];
  const previous = new Map();
  const distance = new Map([[keyOf(start.row, start.col), 0]]);
  const settled = new Set();

  const heap = new MinHeap(byDistanceThenSeq);
  let seq = 0;
  heap.push({ cell: startCell, dist: 0, seq: seq++ });
  let found = false;

  while (!heap.isEmpty()) {
    const { cell, dist } = heap.pop();
    const key = keyOf(cell.row, cell.col);

    // Stale entry: this cell was already settled via a cheaper route.
    if (settled.has(key)) continue;
    settled.add(key);
    visitedInOrder.push(cell);

    if (cell === endCell) {
      found = true;
      break;
    }

    for (const next of getNeighbors(grid, cell)) {
      const nextKey = keyOf(next.row, next.col);
      if (settled.has(nextKey)) continue;

      // Cost of a move = weight of the cell being entered.
      const candidate = dist + (next.weight ?? NORMAL_WEIGHT);
      const known = distance.get(nextKey);
      if (known === undefined || candidate < known) {
        distance.set(nextKey, candidate);
        previous.set(nextKey, cell);
        heap.push({ cell: next, dist: candidate, seq: seq++ });
      }
    }
  }

  return buildResult(visitedInOrder, previous, startCell, endCell, found);
}
