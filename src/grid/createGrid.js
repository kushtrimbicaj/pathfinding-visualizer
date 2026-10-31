import { DEFAULT_COLS, DEFAULT_ROWS, NORMAL_WEIGHT } from './constants.js';

/**
 * A cell is a plain, immutable-by-convention object.
 * Start and end positions are deliberately NOT stored on cells: they live in
 * app state as { row, col }, so dragging them never rebuilds the grid.
 *
 * @typedef {{ row: number, col: number, isWall: boolean, weight: number }} Cell
 * @typedef {Cell[][]} Grid
 * @typedef {{ row: number, col: number }} Position
 */

/** @returns {Cell} */
export function createCell(row, col) {
  return { row, col, isWall: false, weight: NORMAL_WEIGHT };
}

/**
 * Builds an empty rows × cols grid.
 * @returns {Grid}
 */
export function createGrid(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
    throw new RangeError(`Grid dimensions must be positive integers, got ${rows}×${cols}`);
  }
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => createCell(row, col)),
  );
}
