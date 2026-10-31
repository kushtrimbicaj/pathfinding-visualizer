import { cellId } from '../grid/gridUtils.js';
import { PATH_CLASS, VISITED_CLASS } from './paint.js';

const browserScheduler = {
  request: (fn) => requestAnimationFrame(fn),
  cancel: (id) => cancelAnimationFrame(id),
};

function markCell(cell, className) {
  document.getElementById(cellId(cell.row, cell.col))?.classList.add(className);
}

/**
 * Plays a search result back step by step: first the visited cells in the
 * order the algorithm settled them, then the final path.
 *
 * Framework-free on purpose. It never touches React state per cell: it adds
 * CSS classes straight to the cell elements, so a 1,000-cell search causes
 * zero React re-renders. The scheduler and the `mark` function are
 * injectable, which lets the tests drive it with a fake clock.
 *
 * Timing is based on elapsed time, not frame count: on every frame it
 * reveals however many cells are "due" at the current rate. That keeps the
 * speed independent of the monitor's refresh rate, allows several cells per
 * frame at high speeds, and lets the speed change mid-run without a jump.
 *
 * @param {import('../algorithms/path.js').SearchResult} result
 * @param {object} options
 * @param {{visited:number, path:number}} options.speed  cells per second (Infinity = all at once)
 * @param {(p: {phase:string, visited:number, path:number}) => void} [options.onProgress]
 * @param {() => void} [options.onComplete]
 * @param {(cell: object, className: string) => void} [options.mark]
 * @param {{request: Function, cancel: Function}} [options.scheduler]
 */
export function createAnimation(result, options) {
  const {
    onProgress = () => {},
    onComplete = () => {},
    mark = markCell,
    scheduler = browserScheduler,
  } = options;

  const lists = { visited: result.visitedInOrder, path: result.path };
  const classes = { visited: VISITED_CLASS, path: PATH_CLASS };

  let rates = options.speed;
  let phase = 'visited'; // 'visited' -> 'path' -> 'done'
  let index = 0; // next cell to reveal in the current phase
  let baseTime = null; // time the current rate started applying
  let baseIndex = 0; // index at baseTime
  let frameId = null;
  let stopped = false;

  const progress = () => ({
    phase,
    visited: phase === 'visited' ? index : lists.visited.length,
    path: phase === 'path' ? index : phase === 'done' ? lists.path.length : 0,
  });

  function revealUpTo(target) {
    const list = lists[phase];
    const limit = Math.min(target, list.length);
    while (index < limit) mark(list[index++], classes[phase]);
  }

  function nextPhase(time) {
    phase = phase === 'visited' ? 'path' : 'done';
    index = 0;
    baseTime = time;
    baseIndex = 0;
  }

  function complete() {
    stopped = true;
    if (frameId !== null) scheduler.cancel(frameId);
    frameId = null;
    onProgress(progress());
    onComplete();
  }

  function tick(time) {
    frameId = null;
    if (stopped) return;
    if (baseTime === null) {
      baseTime = time;
      baseIndex = index;
    }

    // A phase can finish part-way through a frame, so loop: at Instant speed
    // both phases complete within a single frame.
    while (phase !== 'done') {
      const list = lists[phase];
      const rate = rates[phase];
      const target =
        rate === Infinity ? list.length : baseIndex + Math.floor(((time - baseTime) / 1000) * rate);
      revealUpTo(target);
      if (index < list.length) break;
      nextPhase(time);
    }

    if (phase === 'done') {
      complete();
    } else {
      onProgress(progress());
      frameId = scheduler.request(tick);
    }
  }

  return {
    start() {
      if (stopped || frameId !== null) return;
      frameId = scheduler.request(tick);
    },

    /** Change speed mid-run. Re-anchors timing so playback doesn't jump. */
    setSpeed(nextRates) {
      rates = nextRates;
      baseTime = null;
    },

    /** Reveal everything that's left immediately. */
    finish() {
      if (stopped) return;
      while (phase !== 'done') {
        revealUpTo(Infinity);
        nextPhase(null);
      }
      complete();
    },

    /** Stop without completing. Already revealed cells stay as they are. */
    cancel() {
      stopped = true;
      if (frameId !== null) scheduler.cancel(frameId);
      frameId = null;
    },

    get phase() {
      return phase;
    },

    get isRunning() {
      return !stopped;
    },
  };
}
