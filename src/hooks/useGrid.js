import { useCallback, useState } from 'react';
import { createGrid } from '../grid/createGrid.js';
import { DEFAULT_COLS, DEFAULT_END, DEFAULT_ROWS, DEFAULT_START } from '../grid/constants.js';

/**
 * Owns the board: the grid of cells plus the start and end positions.
 * Editing actions (walls, weights, dragging) are added in Phase 2.
 */
export function useGrid(rows = DEFAULT_ROWS, cols = DEFAULT_COLS) {
  const [grid, setGrid] = useState(() => createGrid(rows, cols));
  const [start, setStart] = useState(DEFAULT_START);
  const [end, setEnd] = useState(DEFAULT_END);

  const resetBoard = useCallback(() => {
    setGrid(createGrid(rows, cols));
    setStart(DEFAULT_START);
    setEnd(DEFAULT_END);
  }, [rows, cols]);

  return { grid, setGrid, start, setStart, end, setEnd, resetBoard };
}
