import { createGrid } from '../grid/createGrid.js';
import { HEAVY_WEIGHT, NORMAL_WEIGHT } from '../grid/constants.js';
import { getNeighbors, isInBounds, samePosition } from '../grid/gridUtils.js';

/** Random element of [min, max] (inclusive) whose value has the given parity (0 = even, 1 = odd). */
function randomWithParity(rand, min, max, parity) {
  const first = min % 2 === parity ? min : min + 1;
  const count = Math.floor((max - first) / 2) + 1;
  return first + 2 * Math.floor(rand() * count);
}

/** Largest odd number ≤ n. */
const lastOdd = (n) => (n % 2 === 1 ? n : n - 1);

/**
 * Recursive division maze, returned as a boolean wall map.
 *
 * Walls only ever go on EVEN rows/columns and gaps only on ODD ones, and
 * open "rooms" are the odd/odd cells. That alignment guarantees a perfect
 * maze: every room is reachable and a later wall can never seal an earlier
 * gap. Uses an explicit stack instead of recursion.
 *
 * Works best with odd dimensions (the default grid is 21 × 45). With even
 * dimensions the extra last row/column becomes solid wall.
 *
 * @returns {boolean[][]} true where a wall goes
 */
export function recursiveDivisionWalls(rows, cols, rand = Math.random) {
  const maxRow = lastOdd(rows - 2);
  const maxCol = lastOdd(cols - 2);
  const walls = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => r === 0 || c === 0 || r > maxRow || c > maxCol),
  );
  if (maxRow < 1 || maxCol < 1) return walls;

  // Each chamber is [rowStart, rowEnd, colStart, colEnd], all odd, inclusive.
  const stack = [[1, maxRow, 1, maxCol]];
  while (stack.length) {
    const [r1, r2, c1, c2] = stack.pop();
    const height = r2 - r1;
    const width = c2 - c1;
    if (height < 2 || width < 2) continue;

    // Cut across the longer side so corridors don't get long and thin.
    const horizontal = height > width ? true : width > height ? false : rand() < 0.5;

    if (horizontal) {
      const wallRow = randomWithParity(rand, r1 + 1, r2 - 1, 0);
      const gapCol = randomWithParity(rand, c1, c2, 1);
      for (let c = c1; c <= c2; c++) if (c !== gapCol) walls[wallRow][c] = true;
      stack.push([r1, wallRow - 1, c1, c2], [wallRow + 1, r2, c1, c2]);
    } else {
      const wallCol = randomWithParity(rand, c1 + 1, c2 - 1, 0);
      const gapRow = randomWithParity(rand, r1, r2, 1);
      for (let r = r1; r <= r2; r++) if (r !== gapRow) walls[r][wallCol] = true;
      stack.push([r1, r2, c1, wallCol - 1], [r1, r2, wallCol + 1, c2]);
    }
  }
  return walls;
}

/**
 * Makes sure an endpoint is open and connected. Start/end can sit anywhere,
 * including on a wall line, so: clear the cell, and if it is still boxed in
 * (e.g. on a wall intersection or a corner), clear its neighbours too. Each
 * neighbour of a wall-line cell touches an open room, so this reconnects it.
 */
function openEndpoint(grid, pos) {
  const next = grid.map((row) => row.slice());
  next[pos.row][pos.col] = { ...next[pos.row][pos.col], isWall: false, weight: NORMAL_WEIGHT };
  if (getNeighbors(next, next[pos.row][pos.col]).length === 0) {
    for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (isInBounds(next, r, c)) next[r][c] = { ...next[r][c], isWall: false };
    }
  }
  return next;
}

/** Builds a fresh grid (no weights) from a wall map. */
function gridFromWalls(walls) {
  const grid = createGrid(walls.length, walls[0].length);
  return grid.map((row) => row.map((cell) => (walls[cell.row][cell.col] ? { ...cell, isWall: true } : cell)));
}

/** A maze from recursive division, with start and end guaranteed open and reachable. */
export function generateMaze(rows, cols, start, end, rand = Math.random) {
  let grid = gridFromWalls(recursiveDivisionWalls(rows, cols, rand));
  grid = openEndpoint(grid, start);
  grid = openEndpoint(grid, end);
  return grid;
}

/**
 * Scattered walls at the given density. Not guaranteed solvable, which is
 * deliberate: it's a quick way to see how each algorithm reports "no path".
 */
export function generateRandomWalls(rows, cols, start, end, density = 0.3, rand = Math.random) {
  const grid = createGrid(rows, cols).map((row) =>
    row.map((cell) => {
      if (samePosition(cell, start) || samePosition(cell, end)) return cell;
      return rand() < density ? { ...cell, isWall: true } : cell;
    }),
  );
  return grid;
}

/** Replaces all weights with randomly placed ones. Walls are kept. */
export function generateRandomWeights(grid, start, end, density = 0.3, rand = Math.random) {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.isWall || samePosition(cell, start) || samePosition(cell, end)) {
        return cell.weight === NORMAL_WEIGHT ? cell : { ...cell, weight: NORMAL_WEIGHT };
      }
      const weight = rand() < density ? HEAVY_WEIGHT : NORMAL_WEIGHT;
      return weight === cell.weight ? cell : { ...cell, weight };
    }),
  );
}
