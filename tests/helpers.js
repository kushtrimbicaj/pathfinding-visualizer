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

/** Small seeded PRNG so "random" tests are reproducible. Returns floats in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random grid with walls and weights; start and end are kept open. */
export function randomGrid(rows, cols, seed, { wallChance = 0.25, weightChance = 0.2 } = {}) {
  const rand = mulberry32(seed);
  let grid = createGrid(rows, cols);
  const start = { row: 0, col: 0 };
  const end = { row: rows - 1, col: cols - 1 };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === start.row && c === start.col) || (r === end.row && c === end.col)) continue;
      const x = rand();
      if (x < wallChance) grid = setWall(grid, r, c, true);
      else if (x < wallChance + weightChance) grid = setWeight(grid, r, c, true);
    }
  }
  return { grid, start, end };
}

/**
 * Independent reference for the cheapest path cost: Bellman-Ford style
 * relaxation until nothing changes. Slow (O(V·E)) but obviously correct,
 * which is the point. Returns Infinity when unreachable.
 */
export function referenceCheapestCost(grid, start, end) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  dist[start.row][start.col] = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].isWall || dist[r][c] === Infinity) continue;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc].isWall) continue;
          const candidate = dist[r][c] + grid[nr][nc].weight;
          if (candidate < dist[nr][nc]) {
            dist[nr][nc] = candidate;
            changed = true;
          }
        }
      }
    }
  }
  return dist[end.row][end.col];
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
