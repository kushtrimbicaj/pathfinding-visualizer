import { describe, expect, it } from 'vitest';
import { dijkstra } from '../src/algorithms/dijkstra.js';
import { bfs } from '../src/algorithms/bfs.js';
import { createGrid } from '../src/grid/createGrid.js';
import { keyOf, setWall } from '../src/grid/gridUtils.js';
import { isValidPath, parseGrid, randomGrid, referenceCheapestCost } from './helpers.js';

describe('dijkstra', () => {
  it('finds a straight path on an open grid', () => {
    const { grid, start, end } = parseGrid(['S...E']);
    const result = dijkstra(grid, start, end);
    expect(result.found).toBe(true);
    expect(result.steps).toBe(4);
    expect(result.cost).toBe(4);
    expect(isValidPath(result.path, start, end)).toBe(true);
  });

  it('goes around weights when the detour is cheaper', () => {
    const { grid, start, end } = parseGrid([
      '.....',
      'SwwwE',
      '.....',
    ]);
    const result = dijkstra(grid, start, end);
    // Detour: up, 4 across, down = 6 steps, cost 6 (vs 16 straight through).
    expect(result.steps).toBe(6);
    expect(result.cost).toBe(6);
    expect(result.path.some((c) => c.weight > 1)).toBe(false);
    expect(isValidPath(result.path, start, end)).toBe(true);
  });

  it('goes through a weight when the detour would cost more', () => {
    const { grid, start, end } = parseGrid([
      '...#...',
      '...#...',
      'S..w..E',
      '...#...',
      '...#...',
    ]);
    const result = dijkstra(grid, start, end);
    expect(result.steps).toBe(6);
    expect(result.cost).toBe(5 + 5); // five normal cells + one weight
    expect(isValidPath(result.path, start, end)).toBe(true);
  });

  it('beats BFS on cost when weights block the direct route', () => {
    const { grid, start, end } = parseGrid([
      '.......',
      'S.www.E',
      '.......',
    ]);
    const b = bfs(grid, start, end);
    const d = dijkstra(grid, start, end);
    expect(b.steps).toBe(6);
    expect(b.cost).toBe(18);
    expect(d.cost).toBe(8);
    expect(d.steps).toBe(8); // more steps, lower cost
  });

  it('reports no path when the end is walled off', () => {
    const { grid, start, end } = parseGrid([
      'S.w#.',
      '...#E',
      '...#.',
    ]);
    const result = dijkstra(grid, start, end);
    expect(result.found).toBe(false);
    expect(result.path).toEqual([]);
    expect(result.cost).toBe(0);
    expect(result.visitedInOrder).toHaveLength(9);
  });

  it('handles start equal to end', () => {
    const pos = { row: 1, col: 1 };
    const result = dijkstra(createGrid(3, 3), pos, pos);
    expect(result.found).toBe(true);
    expect(result.path).toHaveLength(1);
    expect(result.cost).toBe(0);
  });

  it('returns an empty result for invalid endpoints', () => {
    const grid = setWall(createGrid(3, 3), 1, 1, true);
    expect(dijkstra(grid, { row: 1, col: 1 }, { row: 0, col: 0 }).found).toBe(false);
    expect(dijkstra(grid, { row: 0, col: 0 }, { row: -1, col: 0 }).visitedInOrder).toEqual([]);
  });

  it('settles every cell at most once', () => {
    const { grid, start, end } = randomGrid(15, 15, 7);
    const keys = dijkstra(grid, start, end).visitedInOrder.map((c) => keyOf(c.row, c.col));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('settles cells in non-decreasing distance order', () => {
    const { grid, start } = randomGrid(15, 15, 11);
    // Target an unreachable corner so the whole reachable region is settled.
    const walled = setWall(grid, 14, 14, true);
    const result = dijkstra(walled, start, { row: 14, col: 13 });
    const order = result.visitedInOrder.map((c) => referenceCheapestCost(walled, start, c));
    for (let i = 1; i < order.length; i++) expect(order[i] >= order[i - 1]).toBe(true);
  });

  it('matches BFS on an unweighted grid', () => {
    const { grid, start, end } = randomGrid(20, 20, 3, { weightChance: 0 });
    const b = bfs(grid, start, end);
    const d = dijkstra(grid, start, end);
    expect(d.found).toBe(b.found);
    expect(d.steps).toBe(b.steps);
    expect(d.cost).toBe(b.cost);
  });

  it('is deterministic', () => {
    const { grid, start, end } = randomGrid(20, 20, 5);
    const a = dijkstra(grid, start, end).path.map((c) => keyOf(c.row, c.col));
    const b = dijkstra(grid, start, end).path.map((c) => keyOf(c.row, c.col));
    expect(a).toEqual(b);
  });

  it('handles a large weighted grid quickly', () => {
    const { grid, start, end } = randomGrid(200, 200, 99, { wallChance: 0.1, weightChance: 0.3 });
    const t0 = performance.now();
    dijkstra(grid, start, end);
    expect(performance.now() - t0 < 1000).toBe(true);
  });
});

describe('dijkstra vs reference solver (200 random grids)', () => {
  it('always finds the optimal cost, and never costs more than BFS', () => {
    let reachable = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const { grid, start, end } = randomGrid(12, 16, seed);
      const expected = referenceCheapestCost(grid, start, end);
      const d = dijkstra(grid, start, end);
      const b = bfs(grid, start, end);

      if (expected === Infinity) {
        expect(d.found).toBe(false);
        expect(b.found).toBe(false);
        continue;
      }
      reachable++;
      expect(d.found).toBe(true);
      expect(d.cost).toBe(expected);
      expect(isValidPath(d.path, start, end)).toBe(true);
      expect(d.cost <= b.cost).toBe(true);
      expect(b.steps <= d.steps).toBe(true);
    }
    // Make sure the test actually exercised solvable boards.
    expect(reachable > 50).toBe(true);
  });
});
