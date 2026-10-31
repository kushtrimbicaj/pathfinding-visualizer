import { createGrid } from '../src/grid/createGrid.js';
import { setWall, setWeight } from '../src/grid/gridUtils.js';

/**
 * Builds a grid from an ASCII picture, which keeps test cases readable:
 *   S = start   E = end   # = wall   w = weight   . = open
 */
export function parseGrid(lines) {
  let grid = createGrid(lines.length, lines[0].length);
  let start = null;
  let end = null;

  lines.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === '#') grid = setWall(grid, row, col, true);
      else if (ch === 'w') grid = setWeight(grid, row, col, true);
      else if (ch === 'S') start = { row, col };
      else if (ch === 'E') end = { row, col };
    });
  });

  return { grid, start, end };
}

/** Asserts a path is a valid walk: starts/ends correctly, adjacent steps, no walls. */
export function isValidPath(path, start, end) {
  if (!path.length) return false;
  const first = path[0];
  const last = path[path.length - 1];
  if (first.row !== start.row || first.col !== start.col) return false;
  if (last.row !== end.row || last.col !== end.col) return false;
  for (let i = 1; i < path.length; i++) {
    const d = Math.abs(path[i].row - path[i - 1].row) + Math.abs(path[i].col - path[i - 1].col);
    if (d !== 1 || path[i].isWall) return false;
  }
  return true;
}
