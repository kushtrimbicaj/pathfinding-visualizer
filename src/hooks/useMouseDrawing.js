import { useCallback, useMemo, useRef } from 'react';
import { samePosition } from '../grid/gridUtils.js';
import {
  BRUSH,
  canPlaceEndpoint,
  cellsOnLine,
  initialPaintValue,
  paintCells,
} from '../grid/editing.js';

/** Finds the grid cell under the pointer, or null if it's outside the grid. */
function positionFromEvent(event) {
  const el = document.elementFromPoint(event.clientX, event.clientY);
  const cellEl = el?.closest?.('[data-row][data-col]');
  if (!cellEl || !event.currentTarget.contains(cellEl)) return null;
  return { row: Number(cellEl.dataset.row), col: Number(cellEl.dataset.col) };
}

/**
 * Pointer interaction for the grid, using event delegation: one set of
 * handlers on the grid element instead of handlers on every cell.
 *
 * - Press on start/end and drag to move it.
 * - Press elsewhere and drag to paint with the current brush.
 *   Holding Shift while pressing uses the weight brush.
 *
 * Pointer events (not mouse events) make this work with touch and pen too.
 * Pointer capture keeps the stroke alive if the pointer leaves the grid.
 */
export function useMouseDrawing({ grid, start, end, brush, locked, setGrid, setStart, setEnd }) {
  // Handlers read the latest state from a ref, so they stay stable and never
  // close over a stale grid mid-stroke.
  const latest = useRef(null);
  latest.current = { grid, start, end, brush, locked };

  // Current gesture: null | { type: 'paint', brush, value, last } | { type: 'move-start' | 'move-end' }
  const gesture = useRef(null);

  const onPointerDown = useCallback(
    (event) => {
      const { grid, start, end, brush, locked } = latest.current;
      if (locked || event.button !== 0) return;
      const pos = positionFromEvent(event);
      if (!pos) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);

      if (samePosition(pos, start)) {
        gesture.current = { type: 'move-start' };
        return;
      }
      if (samePosition(pos, end)) {
        gesture.current = { type: 'move-end' };
        return;
      }

      const activeBrush = event.shiftKey ? BRUSH.WEIGHT : brush;
      const value = initialPaintValue(grid[pos.row][pos.col], activeBrush);
      gesture.current = { type: 'paint', brush: activeBrush, value, last: pos };
      setGrid((g) => paintCells(g, [pos], activeBrush, value, start, end));
    },
    [setGrid],
  );

  const onPointerMove = useCallback(
    (event) => {
      const current = gesture.current;
      if (!current) return;
      const { grid, start, end, locked } = latest.current;
      if (locked) return;
      const pos = positionFromEvent(event);
      if (!pos) return;

      if (current.type === 'paint') {
        if (samePosition(pos, current.last)) return;
        const segment = cellsOnLine(current.last, pos);
        current.last = pos;
        setGrid((g) => paintCells(g, segment, current.brush, current.value, start, end));
      } else if (current.type === 'move-start') {
        if (!samePosition(pos, start) && canPlaceEndpoint(grid, pos, end)) setStart(pos);
      } else if (!samePosition(pos, end) && canPlaceEndpoint(grid, pos, start)) {
        setEnd(pos);
      }
    },
    [setGrid, setStart, setEnd],
  );

  const endGesture = useCallback(() => {
    gesture.current = null;
  }, []);

  return useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
      onLostPointerCapture: endGesture,
    }),
    [onPointerDown, onPointerMove, endGesture],
  );
}
