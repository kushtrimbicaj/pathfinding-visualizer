import { cellId } from '../grid/gridUtils.js';

export const VISITED_CLASS = 'cell--visited';
export const PATH_CLASS = 'cell--path';

const cellElement = (cell) => document.getElementById(cellId(cell.row, cell.col));

/**
 * Removes all visited/path colouring. These classes are added straight to
 * the DOM (outside React), so React's own className for each cell is
 * untouched and nothing re-renders.
 */
export function clearVisualization(root = document) {
  // Scoped to the grid so the legend swatches (which reuse these classes) keep their colours.
  root
    .querySelectorAll(`.grid .${VISITED_CLASS}, .grid .${PATH_CLASS}`)
    .forEach((el) => el.classList.remove(VISITED_CLASS, PATH_CLASS));
}

/**
 * Shows a finished search result immediately, with no animation.
 * Phase 5 replaces this with step-by-step playback; it will remain the
 * "instant" speed setting.
 * @param {import('../algorithms/path.js').SearchResult} result
 */
export function paintInstant(result) {
  clearVisualization();
  for (const cell of result.visitedInOrder) cellElement(cell)?.classList.add(VISITED_CLASS);
  for (const cell of result.path) cellElement(cell)?.classList.add(PATH_CLASS);
}
