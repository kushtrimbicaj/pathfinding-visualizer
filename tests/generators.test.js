import { describe, expect, it } from 'vitest';
import {
  generateMaze,
  generateRandomWalls,
  generateRandomWeights,
  recursiveDivisionWalls,
} from '../src/algorithms/generators.js';
import { bfs } from '../src/algorithms/bfs.js';
import { createGrid } from '../src/grid/createGrid.js';
import { DEFAULT_COLS, DEFAULT_END, DEFAULT_ROWS, DEFAULT_START, HEAVY_WEIGHT } from '../src/grid/constants.js';
import { setWall } from '../src/grid/gridUtils.js';
import { mulberry32 } from './helpers.js';

/** Counts open cells reachable from (1,1) with a flood fill. */
function reachableOpenCells(walls) {
  const rows = walls.length;
  const cols = walls[0].length;
  const seen = new Set(['1,1']);
  const stack = [[1, 1]];
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const k = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || walls[nr][nc] || seen.has(k)) continue;
      seen.add(k);
      stack.push([nr, nc]);
    }
  }
  return seen.size;
}

const openCount = (walls) => walls.flat().filter((w) => !w).length;

describe('recursiveDivisionWalls', () => {
  it('has a solid border', () => {
    const walls = recursiveDivisionWalls(21, 45, mulberry32(1));
    for (let c = 0; c < 45; c++) expect(walls[0][c] && walls[20][c]).toBe(true);
    for (let r = 0; r < 21; r++) expect(walls[r][0] && walls[r][44]).toBe(true);
  });

  it('never walls off an odd/odd room', () => {
    const walls = recursiveDivisionWalls(21, 45, mulberry32(2));
    for (let r = 1; r < 20; r += 2) for (let c = 1; c < 44; c += 2) expect(walls[r][c]).toBe(false);
  });

  it('produces a fully connected maze for many seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const walls = recursiveDivisionWalls(21, 45, mulberry32(seed));
      expect(reachableOpenCells(walls)).toBe(openCount(walls));
    }
  });

  it('produces a perfect maze (a tree: open edges = open cells - 1)', () => {
    const walls = recursiveDivisionWalls(15, 25, mulberry32(9));
    let edges = 0;
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 25; c++) {
        if (walls[r][c]) continue;
        if (c + 1 < 25 && !walls[r][c + 1]) edges++;
        if (r + 1 < 15 && !walls[r + 1][c]) edges++;
      }
    }
    expect(edges).toBe(openCount(walls) - 1);
  });

  it('is deterministic for a given seed and varies across seeds', () => {
    const a = recursiveDivisionWalls(21, 45, mulberry32(5));
    const b = recursiveDivisionWalls(21, 45, mulberry32(5));
    const c = recursiveDivisionWalls(21, 45, mulberry32(6));
    expect(a).toEqual(b);
    expect(JSON.stringify(a) === JSON.stringify(c)).toBe(false);
  });

  it('handles even dimensions and tiny grids', () => {
    const walls = recursiveDivisionWalls(10, 12, mulberry32(3));
    expect(reachableOpenCells(walls)).toBe(openCount(walls));
    expect(recursiveDivisionWalls(2, 2, mulberry32(1)).flat().every(Boolean)).toBe(true);
  });
});

describe('generateMaze', () => {
  it('keeps the default start and end reachable for many seeds', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const grid = generateMaze(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END, mulberry32(seed));
      expect(bfs(grid, DEFAULT_START, DEFAULT_END).found).toBe(true);
    }
  });

  it('keeps start and end reachable wherever they are, including corners and wall lines', () => {
    const rows = 11;
    const cols = 15;
    const rand = mulberry32(77);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const start = { row: r, col: c };
        const end = { row: rows - 1 - r, col: cols - 1 - c };
        if (start.row === end.row && start.col === end.col) continue;
        const grid = generateMaze(rows, cols, start, end, rand);
        expect(bfs(grid, start, end).found).toBe(true);
      }
    }
  });

  it('contains no weights', () => {
    const grid = generateMaze(21, 45, DEFAULT_START, DEFAULT_END, mulberry32(4));
    expect(grid.flat().some((cell) => cell.weight === HEAVY_WEIGHT)).toBe(false);
  });
});

describe('generateRandomWalls', () => {
  it('roughly matches the requested density and keeps endpoints open', () => {
    const start = { row: 0, col: 0 };
    const end = { row: 29, col: 29 };
    const grid = generateRandomWalls(30, 30, start, end, 0.3, mulberry32(8));
    const ratio = grid.flat().filter((c) => c.isWall).length / 900;
    expect(ratio > 0.25 && ratio < 0.35).toBe(true);
    expect(grid[0][0].isWall || grid[29][29].isWall).toBe(false);
  });
});

describe('generateRandomWeights', () => {
  it('keeps walls, never weights walls or endpoints, and replaces old weights', () => {
    const start = { row: 0, col: 0 };
    const end = { row: 9, col: 9 };
    let grid = setWall(createGrid(10, 10), 5, 5, true);
    grid = generateRandomWeights(grid, start, end, 1, mulberry32(1)); // density 1 = every open cell
    expect(grid[5][5]).toMatchObject({ isWall: true, weight: 1 });
    expect(grid[0][0].weight).toBe(1);
    expect(grid[9][9].weight).toBe(1);
    expect(grid[3][3].weight).toBe(HEAVY_WEIGHT);

    const cleared = generateRandomWeights(grid, start, end, 0, mulberry32(1));
    expect(cleared.flat().some((c) => c.weight === HEAVY_WEIGHT)).toBe(false);
  });
});
