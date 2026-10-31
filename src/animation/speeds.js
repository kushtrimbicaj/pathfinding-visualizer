/**
 * Playback speeds in CELLS PER SECOND rather than "ms delay per cell".
 * The animator is time-based, so a speed looks the same on a 60 Hz and a
 * 144 Hz monitor, and can go faster than one cell per frame.
 * The path is traced more slowly than the search so it reads as a separate step.
 */
export const SPEEDS = [
  { id: 'slow', label: 'Slow', visited: 30, path: 12 },
  { id: 'medium', label: 'Medium', visited: 120, path: 30 },
  { id: 'fast', label: 'Fast', visited: 480, path: 90 },
  { id: 'instant', label: 'Instant', visited: Infinity, path: Infinity },
];

export const DEFAULT_SPEED_ID = 'medium';

export const getSpeed = (id) => SPEEDS.find((s) => s.id === id) ?? SPEEDS[1];
