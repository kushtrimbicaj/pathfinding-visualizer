import { HEAVY_WEIGHT, NORMAL_WEIGHT } from './constants.js';

// Fixed order (up, right, down, left) keeps traversal deterministic,
// so the same grid always animates the same way and tests are stable.
const DIRECTIONS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

export const rowCount = (grid) => grid.length;
export const colCount = (grid) => (grid.length ? grid[0].length : 0);

export function isInBounds(grid, row, col) {
  return row >= 0 && col >= 0 && row < rowCount(grid) && col < colCount(grid);
}

export function samePosition(a, b) {
  return Boolean(a && b) && a.row === b.row && a.col === b.col;
}

/** Stable string key for maps/sets, e.g. "3,7". */
export const keyOf = (row, col) => `${row},${col}`;

/** DOM id used by the animator to reach a cell without a React re-render. */
export const cellId = (row, col) => `cell-${row}-${col}`;

/**
 * Orthogonal neighbours of a cell that are in bounds and not walls.
 * @returns {import('./createGrid.js').Cell[]}
 */
export function getNeighbors(grid, cell) {
  const result = [];
  for (const [dr, dc] of DIRECTIONS) {
    const r = cell.row + dr;
    const c = cell.col + dc;
    if (isInBounds(grid, r, c) && !grid[r][c].isWall) result.push(grid[r][c]);
  }
  return result;
}

/**
 * Returns a new grid with one cell replaced. Only the affected row is copied,
 * so React can skip every untouched row by reference equality.
 */
export function updateCell(grid, row, col, changes) {
  if (!isInBounds(grid, row, col)) return grid;
  const current = grid[row][col];
  const next = { ...current, ...changes };
  if (next.isWall === current.isWall && next.weight === current.weight) return grid;
  const newRow = grid[row].slice();
  newRow[col] = next;
  const newGrid = grid.slice();
  newGrid[row] = newRow;
  return newGrid;
}

/** Walls and weights are mutually exclusive: placing one clears the other. */
export function setWall(grid, row, col, isWall) {
  return updateCell(grid, row, col, { isWall, weight: NORMAL_WEIGHT });
}

export function setWeight(grid, row, col, isHeavy) {
  return updateCell(grid, row, col, {
    isWall: false,
    weight: isHeavy ? HEAVY_WEIGHT : NORMAL_WEIGHT,
  });
}

function mapCells(grid, fn) {
  return grid.map((row) => row.map(fn));
}

export function clearWalls(grid) {
  return mapCells(grid, (cell) => (cell.isWall ? { ...cell, isWall: false } : cell));
}

export function clearWeights(grid) {
  return mapCells(grid, (cell) =>
    cell.weight !== NORMAL_WEIGHT ? { ...cell, weight: NORMAL_WEIGHT } : cell,
  );
}

/** Start/end must always sit on open cells. */
export function isOpen(grid, pos) {
  return isInBounds(grid, pos.row, pos.col) && !grid[pos.row][pos.col].isWall;
}
