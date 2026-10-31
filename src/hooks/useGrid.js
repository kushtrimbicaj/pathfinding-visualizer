import { useCallback, useState } from 'react';
import { createGrid } from '../grid/createGrid.js';
import { clearWalls, clearWeights } from '../grid/gridUtils.js';
import { DEFAULT_COLS, DEFAULT_END, DEFAULT_ROWS, DEFAULT_START } from '../grid/constants.js';

/**
 * Owns the board: the grid of cells plus the start and end positions.
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

  const removeWalls = useCallback(() => setGrid(clearWalls), []);
  const removeWeights = useCallback(() => setGrid(clearWeights), []);

  return {
    grid,
    setGrid,
    start,
    setStart,
    end,
    setEnd,
    resetBoard,
    removeWalls,
    removeWeights,
  };
}
