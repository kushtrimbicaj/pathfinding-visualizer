export const VISITED_CLASS = 'cell--visited';
export const PATH_CLASS = 'cell--path';

/**
 * Removes all visited/path colouring. These classes are added straight to
 * the DOM by the animator (outside React), so React's own className for each
 * cell is untouched and nothing re-renders.
 */
export function clearVisualization(root = document) {
  // Scoped to the grid so the legend swatches (which reuse these classes) keep their colours.
  root
    .querySelectorAll(`.grid .${VISITED_CLASS}, .grid .${PATH_CLASS}`)
    .forEach((el) => el.classList.remove(VISITED_CLASS, PATH_CLASS));
}
