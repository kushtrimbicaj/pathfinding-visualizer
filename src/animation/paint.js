import { cellId } from '../grid/gridUtils.js';

export const VISITED_CLASS = 'cell--visited';
export const PATH_CLASS = 'cell--path';
/** Outline marking the first algorithm's path during "Run both". */
export const ALT_PATH_CLASS = 'cell--path-alt';

const ALL_CLASSES = [VISITED_CLASS, PATH_CLASS, ALT_PATH_CLASS];

/**
 * Removes all search colouring. These classes are added straight to the DOM
 * by the animator (outside React), so React's own className for each cell is
 * untouched and nothing re-renders.
 */
export function clearVisualization(root = document) {
  // Scoped to the grid so the legend swatches (which reuse these classes) keep their colours.
  const selector = ALL_CLASSES.map((c) => `.grid .${c}`).join(', ');
  root.querySelectorAll(selector).forEach((el) => el.classList.remove(...ALL_CLASSES));
}

/** Adds a class to every cell of a path at once. */
export function markPath(path, className) {
  for (const cell of path) document.getElementById(cellId(cell.row, cell.col))?.classList.add(className);
}
