import { useCallback, useEffect, useRef, useState } from 'react';
import { createAnimation } from '../animation/animator.js';
import { clearVisualization } from '../animation/paint.js';
import { getSpeed } from '../animation/speeds.js';

/**
 * React wrapper around the framework-free animator. Plays one result, or a
 * sequence of steps one after another (used by "Run both").
 *
 * A step is { result, label, before?() }. `before` runs right before that
 * step starts, which "Run both" uses to clear the first search and keep its
 * path as an outline.
 *
 * status: 'idle' | 'running' | 'done'
 */
export function useAnimator(speedId) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(null);
  const animation = useRef(null);
  const queue = useRef([]);
  const skipping = useRef(false);
  const speedRef = useRef(speedId);

  // Apply speed changes to a run in progress.
  useEffect(() => {
    speedRef.current = speedId;
    animation.current?.setSpeed(getSpeed(speedId));
  }, [speedId]);

  // Never leave a frame loop running after unmount.
  useEffect(() => () => animation.current?.cancel(), []);

  /** @param {object | object[]} steps a SearchResult, or an array of steps */
  const play = useCallback((steps) => {
    animation.current?.cancel();
    clearVisualization();
    queue.current = Array.isArray(steps) ? [...steps] : [{ result: steps }];
    skipping.current = false;
    setStatus('running');

    const next = () => {
      const step = queue.current.shift();
      if (!step) {
        animation.current = null;
        setStatus('done');
        return;
      }
      step.before?.();
      setProgress({ phase: 'visited', visited: 0, path: 0, label: step.label });

      const anim = createAnimation(step.result, {
        speed: getSpeed(speedRef.current),
        onProgress: (p) => setProgress({ ...p, label: step.label }),
        onComplete: next,
      });
      animation.current = anim;
      anim.start();
      // After "Skip to end", every remaining step completes immediately.
      if (skipping.current) anim.finish();
    };

    next();
  }, []);

  /** Jump to the end of the whole run, including any remaining steps. */
  const skip = useCallback(() => {
    skipping.current = true;
    animation.current?.finish();
  }, []);

  /** Abort the current run (if any) and wipe the board's colouring. */
  const reset = useCallback(() => {
    queue.current = [];
    skipping.current = false;
    animation.current?.cancel();
    animation.current = null;
    clearVisualization();
    setStatus('idle');
    setProgress(null);
  }, []);

  return { status, progress, play, skip, reset };
}
