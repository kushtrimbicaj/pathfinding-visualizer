import { useCallback, useEffect, useState } from 'react';
import Grid from './components/Grid.jsx';
import Legend from './components/Legend.jsx';
import ResultSummary from './components/ResultSummary.jsx';
import RunControls from './components/RunControls.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useGrid } from './hooks/useGrid.js';
import { useMouseDrawing } from './hooks/useMouseDrawing.js';
import { BRUSH } from './grid/editing.js';
import { ALGORITHMS, getAlgorithm } from './algorithms/index.js';
import { clearVisualization, paintInstant } from './animation/paint.js';

export default function App() {
  const { grid, setGrid, start, setStart, end, setEnd, resetBoard, removeWalls, removeWeights } =
    useGrid();
  const [brush, setBrush] = useState(BRUSH.WALL);
  const [algorithmId, setAlgorithmId] = useState(ALGORITHMS[0].id);
  // Last run: { algorithm, result } or null.
  const [run, setRun] = useState(null);

  // Becomes true while an algorithm animates (Phase 5).
  const locked = false;

  const handlers = useMouseDrawing({
    grid,
    start,
    end,
    brush,
    locked,
    setGrid,
    setStart,
    setEnd,
  });

  // Any edit to the board makes the shown result stale, so wipe it.
  useEffect(() => {
    clearVisualization();
    setRun(null);
  }, [grid, start, end]);

  const visualize = useCallback(() => {
    const algorithm = getAlgorithm(algorithmId);
    const result = algorithm.run(grid, start, end);
    paintInstant(result);
    setRun({ algorithm, result });
  }, [algorithmId, grid, start, end]);

  const clearPath = useCallback(() => {
    clearVisualization();
    setRun(null);
  }, []);

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
          disabled={locked}
        />
      </header>

      <section className="panel">
        <RunControls
          algorithmId={algorithmId}
          onAlgorithmChange={setAlgorithmId}
          onVisualize={visualize}
          onClearPath={clearPath}
          disabled={locked}
        />
        <ResultSummary run={run} />
      </section>

      <Legend />

      <main className="board">
        <Grid grid={grid} start={start} end={end} handlers={handlers} locked={locked} />
      </main>

      <p className="hint">
        Click and drag to draw with the selected brush. Click a wall or weight to start erasing.
        Hold <kbd>Shift</kbd> to draw weights. Drag the green and red squares to move start and
        destination.
      </p>
    </div>
  );
}
