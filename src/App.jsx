import { useCallback, useEffect, useMemo, useState } from 'react';
import BoardControls from './components/BoardControls.jsx';
import Grid from './components/Grid.jsx';
import Legend from './components/Legend.jsx';
import ResultSummary from './components/ResultSummary.jsx';
import RunControls from './components/RunControls.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import { useGrid } from './hooks/useGrid.js';
import { useMouseDrawing } from './hooks/useMouseDrawing.js';
import { useAnimator } from './hooks/useAnimator.js';
import { BRUSH } from './grid/editing.js';
import { HEAVY_WEIGHT } from './grid/constants.js';
import { colCount, rowCount } from './grid/gridUtils.js';
import { ALGORITHMS } from './algorithms/index.js';
import { describeComparison, runAll } from './algorithms/compare.js';
import {
  generateMaze,
  generateRandomWalls,
  generateRandomWeights,
} from './algorithms/generators.js';
import { ALT_PATH_CLASS, clearVisualization, markPath } from './animation/paint.js';
import { DEFAULT_SPEED_ID } from './animation/speeds.js';

export default function App() {
  const { grid, setGrid, start, setStart, end, setEnd, resetBoard, removeWalls, removeWeights } =
    useGrid();
  const [brush, setBrush] = useState(BRUSH.WALL);
  const [algorithmId, setAlgorithmId] = useState(ALGORITHMS[0].id);
  const [speedId, setSpeedId] = useState(DEFAULT_SPEED_ID);
  // Last run: { mode: 'single' | 'both', primaryId, entries } or null.
  const [run, setRun] = useState(null);

  const { status, progress, play, skip, reset: resetAnimation } = useAnimator(speedId);
  const running = status === 'running';

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

  const hasWeights = useMemo(
    () => grid.some((row) => row.some((cell) => cell.weight === HEAVY_WEIGHT)),
    [grid],
  );

  // Every run computes all algorithms (each takes well under a millisecond),
  // so the comparison panel is filled no matter which one is animated.
  const visualize = useCallback(() => {
    const entries = runAll(grid, start, end);
    const primary = entries.find((e) => e.algorithm.id === algorithmId);
    setRun({ mode: 'single', primaryId: algorithmId, entries });
    play([{ result: primary.result, label: primary.algorithm.shortName }]);
  }, [algorithmId, grid, start, end, play]);

  const runBoth = useCallback(() => {
    const entries = runAll(grid, start, end);
    const [first, second] = entries;
    setRun({ mode: 'both', primaryId: second.algorithm.id, entries });
    play([
      { result: first.result, label: first.algorithm.shortName },
      {
        result: second.result,
        label: second.algorithm.shortName,
        // Clear the first search but keep its path as an outline to compare against.
        before: () => {
          clearVisualization();
          markPath(first.result.path, ALT_PATH_CLASS);
        },
      },
    ]);
  }, [grid, start, end, play]);

  const clearPath = useCallback(() => {
    resetAnimation();
    setRun(null);
  }, [resetAnimation]);

  const rows = rowCount(grid);
  const cols = colCount(grid);
  const makeMaze = useCallback(() => setGrid(generateMaze(rows, cols, start, end)), [rows, cols, start, end, setGrid]);
  const makeRandomWalls = useCallback(
    () => setGrid(generateRandomWalls(rows, cols, start, end)),
    [rows, cols, start, end, setGrid],
  );
  const makeRandomWeights = useCallback(
    () => setGrid((g) => generateRandomWeights(g, start, end)),
    [start, end, setGrid],
  );

  // Escape stops a run in progress.
  useEffect(() => {
    if (!running) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') clearPath();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, clearPath]);

  const insight = run ? describeComparison(run.entries, { hasWeights }) : '';

  return (
    <div className="app">
      <header className="header">
        <h1>Pathfinding Visualizer</h1>
        <p>
          Draw walls and weights, then watch Breadth-First Search and Dijkstra&apos;s algorithm
          search for a path, step by step.
        </p>
      </header>

      <div className="cards">
        <BoardControls
          brush={brush}
          onBrushChange={setBrush}
          onMaze={makeMaze}
          onRandomWalls={makeRandomWalls}
          onRandomWeights={makeRandomWeights}
          onClearWalls={removeWalls}
          onClearWeights={removeWeights}
          onClearBoard={resetBoard}
          disabled={running}
        />
        <RunControls
          algorithmId={algorithmId}
          onAlgorithmChange={setAlgorithmId}
          onVisualize={visualize}
          onRunBoth={runBoth}
          onClearPath={clearPath}
          onSkip={skip}
          onStop={clearPath}
          speedId={speedId}
          onSpeedChange={setSpeedId}
          running={running}
        />
        <StatsPanel entries={run?.entries} insight={insight} showResults={status === 'done'} />
      </div>

      <div className="status-bar">
        <ResultSummary run={run} status={status} progress={progress} />
        <Legend />
      </div>

      <main className="board">
        <Grid grid={grid} start={start} end={end} handlers={handlers} locked={running} />
      </main>

      <footer className="hint">
        Click and drag to draw with the selected brush; start on a wall or weight to erase. Hold{' '}
        <kbd>Shift</kbd> to draw weights. Drag the green and red squares to move start and
        destination. Press <kbd>Esc</kbd> to stop a running visualization.
      </footer>
    </div>
  );
}
