// Odd dimensions keep the recursive-division maze (Phase 6) aligned on cell boundaries.
export const DEFAULT_ROWS = 21;
export const DEFAULT_COLS = 45;

export const DEFAULT_START = Object.freeze({ row: 10, col: 9 });
export const DEFAULT_END = Object.freeze({ row: 10, col: 35 });

// Cost of entering a normal cell vs a weighted ("mud") cell.
// BFS ignores weights; Dijkstra minimises total cost.
export const NORMAL_WEIGHT = 1;
export const HEAVY_WEIGHT = 5;
