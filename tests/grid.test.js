import { describe, expect, it } from 'vitest';
import { createGrid } from '../src/grid/createGrid.js';
import {
  clearWalls,
  clearWeights,
  getNeighbors,
  isInBounds,
  isOpen,
  keyOf,
  samePosition,
  setWall,
  setWeight,
  updateCell,
} from '../src/grid/gridUtils.js';
import { DEFAULT_COLS, DEFAULT_ROWS, HEAVY_WEIGHT, NORMAL_WEIGHT } from '../src/grid/constants.js';

describe('createGrid', () => {
  it('builds a grid of the default size', () => {
    const grid = createGrid();
    expect(grid.length).toBe(DEFAULT_ROWS);
    expect(grid[0].length).toBe(DEFAULT_COLS);
  });

  it('creates open cells with correct coordinates and normal weight', () => {
    const grid = createGrid(3, 4);
    expect(grid[2][3]).toEqual({ row: 2, col: 3, isWall: false, weight: NORMAL_WEIGHT });
  });

  it('rejects invalid dimensions', () => {
    expect(() => createGrid(0, 5)).toThrow(RangeError);
    expect(() => createGrid(5, -1)).toThrow(RangeError);
    expect(() => createGrid(2.5, 5)).toThrow(RangeError);
  });
});

describe('bounds and positions', () => {
  const grid = createGrid(3, 3);

  it('detects in-bounds coordinates', () => {
    expect(isInBounds(grid, 0, 0)).toBe(true);
    expect(isInBounds(grid, 2, 2)).toBe(true);
    expect(isInBounds(grid, -1, 0)).toBe(false);
    expect(isInBounds(grid, 0, 3)).toBe(false);
  });

  it('compares positions by value', () => {
    expect(samePosition({ row: 1, col: 2 }, { row: 1, col: 2 })).toBe(true);
    expect(samePosition({ row: 1, col: 2 }, { row: 2, col: 1 })).toBe(false);
    expect(samePosition(null, { row: 0, col: 0 })).toBe(false);
  });

  it('produces unique keys', () => {
    expect(keyOf(1, 23)).not.toBe(keyOf(12, 3));
  });
});

describe('getNeighbors', () => {
  it('returns four neighbours in up, right, down, left order', () => {
    const grid = createGrid(3, 3);
    const coords = getNeighbors(grid, grid[1][1]).map((c) => [c.row, c.col]);
    expect(coords).toEqual([
      [0, 1],
      [1, 2],
      [2, 1],
      [1, 0],
    ]);
  });

  it('excludes out-of-bounds cells at corners', () => {
    const grid = createGrid(3, 3);
    expect(getNeighbors(grid, grid[0][0])).toHaveLength(2);
  });

  it('excludes walls', () => {
    let grid = createGrid(3, 3);
    grid = setWall(grid, 0, 1, true);
    grid = setWall(grid, 1, 0, true);
    const coords = getNeighbors(grid, grid[1][1]).map((c) => [c.row, c.col]);
    expect(coords).toEqual([
      [1, 2],
      [2, 1],
    ]);
  });
});

describe('immutable updates', () => {
  it('copies only the changed row', () => {
    const grid = createGrid(3, 3);
    const next = setWall(grid, 1, 1, true);
    expect(next).not.toBe(grid);
    expect(next[1]).not.toBe(grid[1]);
    expect(next[0]).toBe(grid[0]);
    expect(next[2]).toBe(grid[2]);
    expect(grid[1][1].isWall).toBe(false);
    expect(next[1][1].isWall).toBe(true);
  });

  it('returns the same grid when nothing changes', () => {
    const grid = createGrid(3, 3);
    expect(setWall(grid, 1, 1, false)).toBe(grid);
    expect(updateCell(grid, 9, 9, { isWall: true })).toBe(grid);
  });

  it('makes walls and weights mutually exclusive', () => {
    let grid = createGrid(3, 3);
    grid = setWeight(grid, 1, 1, true);
    expect(grid[1][1]).toMatchObject({ isWall: false, weight: HEAVY_WEIGHT });
    grid = setWall(grid, 1, 1, true);
    expect(grid[1][1]).toMatchObject({ isWall: true, weight: NORMAL_WEIGHT });
    grid = setWeight(grid, 1, 1, true);
    expect(grid[1][1]).toMatchObject({ isWall: false, weight: HEAVY_WEIGHT });
  });

  it('clears walls without touching weights, and vice versa', () => {
    let grid = createGrid(3, 3);
    grid = setWall(grid, 0, 0, true);
    grid = setWeight(grid, 2, 2, true);

    const noWalls = clearWalls(grid);
    expect(noWalls[0][0].isWall).toBe(false);
    expect(noWalls[2][2].weight).toBe(HEAVY_WEIGHT);

    const noWeights = clearWeights(grid);
    expect(noWeights[0][0].isWall).toBe(true);
    expect(noWeights[2][2].weight).toBe(NORMAL_WEIGHT);
  });

  it('reports whether a position is open', () => {
    let grid = createGrid(3, 3);
    grid = setWall(grid, 1, 1, true);
    expect(isOpen(grid, { row: 1, col: 1 })).toBe(false);
    expect(isOpen(grid, { row: 0, col: 0 })).toBe(true);
    expect(isOpen(grid, { row: 5, col: 5 })).toBe(false);
  });
});
