import { getNeighbors, isOpen, keyOf } from '../grid/gridUtils.js';
import { buildResult, emptyResult } from './path.js';

/**
 * Breadth-First Search.
 *
 * Explores the grid in rings of increasing distance from the start, so the
 * first time it reaches the end it has found a path with the FEWEST STEPS.
 * It ignores cell weights entirely: on a weighted grid that path is not
 * necessarily the cheapest one (that's Dijkstra's job).
 *
 * Time O(V + E), space O(V). On a grid E ≤ 4V, so effectively O(V).
 *
 * @param {import('../grid/createGrid.js').Grid} grid
 * @param {{row:number,col:number}} start
 * @param {{row:number,col:number}} end
 * @returns {import('./path.js').SearchResult}
 */
export function bfs(grid, start, end) {
  if (!isOpen(grid, start) || !isOpen(grid, end)) return emptyResult();

  const startCell = grid[start.row][start.col];
  const endCell = grid[end.row][end.col];

  const visitedInOrder = [];
  const previous = new Map();
  // "Discovered" is marked when a cell is enqueued, not when it is dequeued,
  // so no cell ever enters the queue twice.
  const discovered = new Set([keyOf(start.row, start.col)]);

  // Array + head index instead of Array.shift(): shift() is O(n) because it
  // re-indexes the array, which makes BFS quadratic on large grids.
  const queue = [startCell];
  let head = 0;
  let found = false;

  while (head < queue.length) {
    const cell = queue[head++];
    visitedInOrder.push(cell);

    if (cell === endCell) {
      found = true;
      break;
    }

    for (const next of getNeighbors(grid, cell)) {
      const key = keyOf(next.row, next.col);
      if (discovered.has(key)) continue;
      discovered.add(key);
      previous.set(key, cell);
      queue.push(next);
    }
  }

  return buildResult(visitedInOrder, previous, startCell, endCell, found);
}
