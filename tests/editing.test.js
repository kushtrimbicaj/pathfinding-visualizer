import { describe, expect, it } from 'vitest';
import { createGrid } from '../src/grid/createGrid.js';
import { setWall, setWeight } from '../src/grid/gridUtils.js';
import {
  BRUSH,
  canPlaceEndpoint,
  cellsOnLine,
  initialPaintValue,
  paintCells,
} from '../src/grid/editing.js';
import { HEAVY_WEIGHT, NORMAL_WEIGHT } from '../src/grid/constants.js';

const start = { row: 0, col: 0 };
const end = { row: 4, col: 4 };
const p = (row, col) => ({ row, col });

describe('cellsOnLine', () => {
  it('returns a single cell when both ends match', () => {
    expect(cellsOnLine(p(2, 2), p(2, 2))).toEqual([p(2, 2)]);
  });

  it('fills a horizontal gap including both endpoints', () => {
    expect(cellsOnLine(p(1, 1), p(1, 4))).toEqual([p(1, 1), p(1, 2), p(1, 3), p(1, 4)]);
  });

  it('works in reverse and vertically', () => {
    expect(cellsOnLine(p(3, 0), p(0, 0))).toEqual([p(3, 0), p(2, 0), p(1, 0), p(0, 0)]);
  });

  it('produces a connected line for diagonals with no gaps', () => {
    const line = cellsOnLine(p(0, 0), p(3, 7));
    expect(line[0]).toEqual(p(0, 0));
    expect(line[line.length - 1]).toEqual(p(3, 7));
    for (let i = 1; i < line.length; i++) {
      const dr = Math.abs(line[i].row - line[i - 1].row);
      const dc = Math.abs(line[i].col - line[i - 1].col);
      expect(Math.max(dr, dc)).toBe(1);
    }
  });
});

describe('initialPaintValue', () => {
  const grid = setWeight(setWall(createGrid(2, 2), 0, 0, true), 1, 1, true);

  it('draws walls on an empty cell and erases on a wall', () => {
    expect(initialPaintValue(grid[0][1], BRUSH.WALL)).toBe(true);
    expect(initialPaintValue(grid[0][0], BRUSH.WALL)).toBe(false);
  });

  it('draws weights on an unweighted cell and erases on a weight', () => {
    expect(initialPaintValue(grid[0][1], BRUSH.WEIGHT)).toBe(true);
    expect(initialPaintValue(grid[1][1], BRUSH.WEIGHT)).toBe(false);
  });
});

describe('paintCells', () => {
  it('draws walls along the given cells', () => {
    const grid = paintCells(createGrid(5, 5), [p(2, 1), p(2, 2)], BRUSH.WALL, true, start, end);
    expect(grid[2][1].isWall).toBe(true);
    expect(grid[2][2].isWall).toBe(true);
    expect(grid[2][3].isWall).toBe(false);
  });

  it('never paints over start or end', () => {
    const grid = paintCells(createGrid(5, 5), [start, end], BRUSH.WALL, true, start, end);
    expect(grid[0][0].isWall).toBe(false);
    expect(grid[4][4].isWall).toBe(false);
  });

  it('drawing a wall replaces a weight', () => {
    let grid = setWeight(createGrid(5, 5), 2, 2, true);
    grid = paintCells(grid, [p(2, 2)], BRUSH.WALL, true, start, end);
    expect(grid[2][2]).toMatchObject({ isWall: true, weight: NORMAL_WEIGHT });
  });

  it('erasing walls leaves weights the stroke passes over', () => {
    let grid = setWall(createGrid(5, 5), 2, 1, true);
    grid = setWeight(grid, 2, 2, true);
    grid = paintCells(grid, [p(2, 1), p(2, 2)], BRUSH.WALL, false, start, end);
    expect(grid[2][1].isWall).toBe(false);
    expect(grid[2][2].weight).toBe(HEAVY_WEIGHT);
  });

  it('erasing weights leaves walls the stroke passes over', () => {
    let grid = setWeight(createGrid(5, 5), 2, 1, true);
    grid = setWall(grid, 2, 2, true);
    grid = paintCells(grid, [p(2, 1), p(2, 2)], BRUSH.WEIGHT, false, start, end);
    expect(grid[2][1].weight).toBe(NORMAL_WEIGHT);
    expect(grid[2][2].isWall).toBe(true);
  });

  it('ignores out-of-bounds positions', () => {
    const grid = createGrid(3, 3);
    expect(paintCells(grid, [p(9, 9)], BRUSH.WALL, true, start, end)).toBe(grid);
  });
});

describe('canPlaceEndpoint', () => {
  const grid = setWall(createGrid(5, 5), 2, 2, true);

  it('allows open cells', () => {
    expect(canPlaceEndpoint(grid, p(1, 1), end)).toBe(true);
  });

  it('rejects walls, the other endpoint and out-of-bounds cells', () => {
    expect(canPlaceEndpoint(grid, p(2, 2), end)).toBe(false);
    expect(canPlaceEndpoint(grid, end, end)).toBe(false);
    expect(canPlaceEndpoint(grid, p(-1, 0), end)).toBe(false);
  });
});
