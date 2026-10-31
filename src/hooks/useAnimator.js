import { useCallback, useEffect, useRef, useState } from 'react';
import { createAnimation } from '../animation/animator.js';
import { clearVisualization } from '../animation/paint.js';
import { getSpeed } from '../animation/speeds.js';

/**
 * React wrapper around the framework-free animator.
 * status: 'idle' | 'running' | 'done'
 */
export function useAnimator(speedId) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(null);
  const animation = useRef(null);
  const speedRef = useRef(speedId);

  // Apply speed changes to a run in progress.
  useEffect(() => {
    speedRef.current = speedId;
    animation.current?.setSpeed(getSpeed(speedId));
  }, [speedId]);

  // Never leave a frame loop running after unmount.
  useEffect(() => () => animation.current?.cancel(), []);

  const play = useCallback((result, onDone) => {
    animation.current?.cancel();
    clearVisualization();
    setStatus('running');
    setProgress({ phase: 'visited', visited: 0, path: 0 });

    const anim = createAnimation(result, {
      speed: getSpeed(speedRef.current),
      onProgress: setProgress,
      onComplete: () => {
        animation.current = null;
        setStatus('done');
        onDone?.();
      },
    });
    animation.current = anim;
    anim.start();
  }, []);

  /** Jump to the end of the current run. */
  const skip = useCallback(() => animation.current?.finish(), []);

  /** Abort the current run (if any) and wipe the board's colouring. */
  const reset = useCallback(() => {
    animation.current?.cancel();
    animation.current = null;
    clearVisualization();
    setStatus('idle');
    setProgress(null);
  }, []);

  return { status, progress, play, skip, reset };
}
