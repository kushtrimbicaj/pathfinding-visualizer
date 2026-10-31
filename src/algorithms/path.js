import { NORMAL_WEIGHT } from '../grid/constants.js';
import { keyOf } from '../grid/gridUtils.js';

/**
 * Walks the `previous` links back from the end cell to the start.
 * @param {Map<string, import('../grid/createGrid.js').Cell>} previous  cell key -> cell it was reached from
 * @returns {import('../grid/createGrid.js').Cell[]} start … end, or [] if end was never reached
 */
export function reconstructPath(previous, startCell, endCell) {
  if (startCell === endCell) return [startCell];
  if (!previous.has(keyOf(endCell.row, endCell.col))) return [];

  const path = [];
  let current = endCell;
  while (current) {
    path.push(current);
    if (current === startCell) break;
    current = previous.get(keyOf(current.row, current.col));
  }
  return path.reverse();
}

/**
 * Total cost of walking a path: the weight of every cell entered.
 * The start cell is not "entered", so it is not counted.
 */
export function pathCost(path) {
  let cost = 0;
  for (let i = 1; i < path.length; i++) cost += path[i].weight ?? NORMAL_WEIGHT;
  return cost;
}

/**
 * Common result shape returned by every algorithm, so the animator and the
 * comparison panel never need to know which algorithm produced it.
 *
 * @typedef {object} SearchResult
 * @property {boolean} found
 * @property {import('../grid/createGrid.js').Cell[]} visitedInOrder  cells in the order they were settled
 * @property {import('../grid/createGrid.js').Cell[]} path            start … end, [] if not found
 * @property {number} steps   moves along the path (path.length - 1), 0 if not found
 * @property {number} cost    sum of weights along the path, 0 if not found
 */
export function buildResult(visitedInOrder, previous, startCell, endCell, found) {
  const path = found ? reconstructPath(previous, startCell, endCell) : [];
  return {
    found,
    visitedInOrder,
    path,
    steps: Math.max(path.length - 1, 0),
    cost: pathCost(path),
  };
}

/** Result for invalid input (start/end missing, off-grid or on a wall). */
export function emptyResult() {
  return { found: false, visitedInOrder: [], path: [], steps: 0, cost: 0 };
}
