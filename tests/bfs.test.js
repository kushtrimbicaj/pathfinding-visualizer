import { describe, expect, it } from 'vitest';
import { bfs } from '../src/algorithms/bfs.js';
import { pathCost, reconstructPath } from '../src/algorithms/path.js';
import { createGrid } from '../src/grid/createGrid.js';
import { keyOf, setWall } from '../src/grid/gridUtils.js';
import { isValidPath, parseGrid } from './helpers.js';

describe('bfs', () => {
  it('finds a straight path on an open grid', () => {
    const { grid, start, end } = parseGrid(['S...E']);
    const result = bfs(grid, start, end);
    expect(result.found).toBe(true);
    expect(result.steps).toBe(4);
    expect(result.cost).toBe(4);
    expect(isValidPath(result.path, start, end)).toBe(true);
  });

  it('finds the Manhattan distance on an open grid', () => {
    const grid = createGrid(10, 10);
    const start = { row: 1, col: 2 };
    const end = { row: 8, col: 7 };
    const result = bfs(grid, start, end);
    expect(result.steps).toBe(7 + 5);
    expect(isValidPath(result.path, start, end)).toBe(true);
  });

  it('detours around walls with the fewest steps', () => {
    const { grid, start, end } = parseGrid([
      '.....',
      'S.#.E',
      '..#..',
    ]);
    const result = bfs(grid, start, end);
    expect(result.found).toBe(true);
    expect(result.steps).toBe(6); // up, across the top, down
    expect(result.path.some((c) => c.isWall)).toBe(false);
    expect(isValidPath(result.path, start, end)).toBe(true);
  });

  it('solves a maze-like layout', () => {
    const { grid, start, end } = parseGrid([
      'S.#.....',
      '#.#.###.',
      '..#...#.',
      '.####.#.',
      '......#E',
    ]);
    const result = bfs(grid, start, end);
    expect(result.found).toBe(true);
    expect(isValidPath(result.path, start, end)).toBe(true);
    // Only route: down the left side, along the bottom, up through the middle
    // gap, across the top and down the right edge.
    expect(result.steps).toBe(25);
  });

  it('reports no path when the end is walled off', () => {
    const { grid, start, end } = parseGrid([
      'S..#.',
      '...#E',
      '...#.',
    ]);
    const result = bfs(grid, start, end);
    expect(result.found).toBe(false);
    expect(result.path).toEqual([]);
    expect(result.steps).toBe(0);
    expect(result.cost).toBe(0);
    // It still explores the whole reachable region (9 open cells left of the wall).
    expect(result.visitedInOrder).toHaveLength(9);
  });

  it('handles start equal to end', () => {
    const grid = createGrid(3, 3);
    const pos = { row: 1, col: 1 };
    const result = bfs(grid, pos, pos);
    expect(result.found).toBe(true);
    expect(result.path).toHaveLength(1);
    expect(result.steps).toBe(0);
    expect(result.visitedInOrder).toHaveLength(1);
  });

  it('returns an empty result for invalid endpoints', () => {
    const grid = setWall(createGrid(3, 3), 1, 1, true);
    expect(bfs(grid, { row: 1, col: 1 }, { row: 0, col: 0 }).found).toBe(false);
    expect(bfs(grid, { row: 0, col: 0 }, { row: 9, col: 9 }).found).toBe(false);
    expect(bfs(grid, { row: 0, col: 0 }, { row: 9, col: 9 }).visitedInOrder).toEqual([]);
  });

  it('ignores weights: takes the fewest steps even through expensive cells', () => {
    const { grid, start, end } = parseGrid([
      '.....',
      'SwwwE',
      '.....',
    ]);
    const result = bfs(grid, start, end);
    expect(result.steps).toBe(4);
    expect(result.cost).toBe(5 + 5 + 5 + 1); // three weights, then the end cell
  });

  it('visits every cell at most once, starting with the start cell', () => {
    const grid = createGrid(8, 8);
    const result = bfs(grid, { row: 0, col: 0 }, { row: 7, col: 7 });
    const keys = result.visitedInOrder.map((c) => keyOf(c.row, c.col));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys[0]).toBe('0,0');
    expect(keys[keys.length - 1]).toBe('7,7');
  });

  it('visits cells in non-decreasing distance from the start', () => {
    const start = { row: 4, col: 4 };
    const result = bfs(createGrid(9, 9), start, { row: 0, col: 0 });
    const dist = result.visitedInOrder.map(
      (c) => Math.abs(c.row - start.row) + Math.abs(c.col - start.col),
    );
    for (let i = 1; i < dist.length; i++) expect(dist[i] >= dist[i - 1]).toBe(true);
  });

  it('is deterministic', () => {
    const { grid, start, end } = parseGrid(['S....', '.#.#.', '....E']);
    const a = bfs(grid, start, end);
    const b = bfs(grid, start, end);
    expect(a.path.map((c) => keyOf(c.row, c.col))).toEqual(b.path.map((c) => keyOf(c.row, c.col)));
  });

  it('handles a large open grid quickly', () => {
    const grid = createGrid(200, 200);
    const t0 = performance.now();
    const result = bfs(grid, { row: 0, col: 0 }, { row: 199, col: 199 });
    expect(result.steps).toBe(398);
    expect(performance.now() - t0 < 500).toBe(true);
  });
});

describe('path helpers', () => {
  it('reconstructPath returns [] when the end was never reached', () => {
    const grid = createGrid(2, 2);
    expect(reconstructPath(new Map(), grid[0][0], grid[1][1])).toEqual([]);
  });

  it('pathCost does not count the start cell', () => {
    const { grid } = parseGrid(['w..']);
    expect(pathCost([grid[0][0], grid[0][1], grid[0][2]])).toBe(2);
    expect(pathCost([])).toBe(0);
  });
});
