import { useCallback, useEffect, useState } from 'react';
import Grid from './components/Grid.jsx';
import Legend from './components/Legend.jsx';
import ResultSummary from './components/ResultSummary.jsx';
import RunControls from './components/RunControls.jsx';
import SpeedControl from './components/SpeedControl.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useGrid } from './hooks/useGrid.js';
import { useMouseDrawing } from './hooks/useMouseDrawing.js';
import { useAnimator } from './hooks/useAnimator.js';
import { BRUSH } from './grid/editing.js';
import { ALGORITHMS, getAlgorithm } from './algorithms/index.js';
import { DEFAULT_SPEED_ID } from './animation/speeds.js';

export default function App() {
  const { grid, setGrid, start, setStart, end, setEnd, resetBoard, removeWalls, removeWeights } =
    useGrid();
  const [brush, setBrush] = useState(BRUSH.WALL);
  const [algorithmId, setAlgorithmId] = useState(ALGORITHMS[0].id);
  const [speedId, setSpeedId] = useState(DEFAULT_SPEED_ID);
  // Last run: { algorithm, result } or null.
  const [run, setRun] = useState(null);

  const animator = useAnimator(speedId);
  const { reset: resetAnimation, play, skip } = animator;
  const running = animator.status === 'running';

  const handlers = useMouseDrawing({
    grid,
    start,
    end,
    brush,
    locked: running,
    setGrid,
    setStart,
    setEnd,
  });

  // Any edit to the board makes the shown result stale, so wipe it.
  // (Editing is locked during a run, so this never interrupts an animation.)
  useEffect(() => {
    resetAnimation();
    setRun(null);
  }, [grid, start, end, resetAnimation]);

  const visualize = useCallback(() => {
    const algorithm = getAlgorithm(algorithmId);
    const result = algorithm.run(grid, start, end);
    setRun({ algorithm, result });
    play(result);
  }, [algorithmId, grid, start, end, play]);

  const clearPath = useCallback(() => {
    resetAnimation();
    setRun(null);
  }, [resetAnimation]);

  // Escape stops a run in progress.
  useEffect(() => {
    if (!running) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') clearPath();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, clearPath]);

  return (
    <div className="app">
      <header className="header">
        <div className="header__title">
          <h1>Pathfinding Visualizer</h1>
          <p>Draw walls and weights, then watch BFS and Dijkstra search for the shortest path.</p>
        </div>
        <Toolbar
          brush={brush}
          onBrushChange={setBrush}
          onClearWalls={removeWalls}
          onClearWeights={removeWeights}
          onClearBoard={resetBoard}
          disabled={running}
        />
      </header>

      <section className="panel">
        <div className="panel__controls">
          <RunControls
            algorithmId={algorithmId}
            onAlgorithmChange={setAlgorithmId}
            onVisualize={visualize}
            onClearPath={clearPath}
            onSkip={skip}
            onStop={clearPath}
            running={running}
          />
          <SpeedControl speedId={speedId} onChange={setSpeedId} />
        </div>
        <ResultSummary run={run} status={animator.status} progress={animator.progress} />
      </section>

      <Legend />

      <main className="board">
        <Grid grid={grid} start={start} end={end} handlers={handlers} locked={running} />
      </main>

      <p className="hint">
        Click and drag to draw with the selected brush. Click a wall or weight to start erasing.
        Hold <kbd>Shift</kbd> to draw weights. Drag the green and red squares to move start and
        destination. Press <kbd>Esc</kbd> to stop a running visualization.
      </p>
    </div>
  );
}
