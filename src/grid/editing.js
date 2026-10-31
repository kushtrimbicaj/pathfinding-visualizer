import { HEAVY_WEIGHT } from './constants.js';
import { isOpen, samePosition, setWall, setWeight } from './gridUtils.js';

export const BRUSH = Object.freeze({ WALL: 'wall', WEIGHT: 'weight' });

/**
 * Decides whether a stroke draws or erases, based on the cell where it starts:
 * starting on a wall with the wall brush erases walls for the whole stroke,
 * otherwise the stroke draws. Same for weights.
 */
export function initialPaintValue(cell, brush) {
  if (brush === BRUSH.WEIGHT) return cell.weight !== HEAVY_WEIGHT;
  return !cell.isWall;
}

/**
 * Every cell on the straight line between two positions (Bresenham).
 * Pointer events fire at a limited rate, so a fast drag can jump several
 * cells between events; filling the gap keeps drawn walls continuous.
 * Includes both endpoints.
 */
export function cellsOnLine(from, to) {
  const cells = [];
  let { row, col } = from;
  const dRow = Math.abs(to.row - row);
  const dCol = Math.abs(to.col - col);
  const stepRow = row < to.row ? 1 : -1;
  const stepCol = col < to.col ? 1 : -1;
  let err = dCol - dRow;

  for (;;) {
    cells.push({ row, col });
    if (row === to.row && col === to.col) return cells;
    const e2 = 2 * err;
    if (e2 > -dRow) {
      err -= dRow;
      col += stepCol;
    }
    if (e2 < dCol) {
      err += dCol;
      row += stepRow;
    }
  }
}

/**
 * Applies one brush stroke segment to the grid.
 * - Start and end cells are never painted.
 * - Drawing overwrites (a wall replaces a weight and vice versa).
 * - Erasing only removes the brush's own type, so erasing walls never
 *   wipes a weight the stroke passes over.
 */
export function paintCells(grid, positions, brush, value, start, end) {
  let next = grid;
  for (const pos of positions) {
    if (samePosition(pos, start) || samePosition(pos, end)) continue;
    const cell = next[pos.row]?.[pos.col];
    if (!cell) continue;

    if (brush === BRUSH.WALL) {
      if (value || cell.isWall) next = setWall(next, pos.row, pos.col, value);
    } else if (value || cell.weight === HEAVY_WEIGHT) {
      next = setWeight(next, pos.row, pos.col, value);
    }
  }
  return next;
}

/** Start/end can move onto any open cell that the other endpoint isn't on. */
export function canPlaceEndpoint(grid, pos, other) {
  return isOpen(grid, pos) && !samePosition(pos, other);
}
