import { useState } from 'react';
import Grid from './components/Grid.jsx';
import Legend from './components/Legend.jsx';
import Toolbar from './components/Toolbar.jsx';
import { useGrid } from './hooks/useGrid.js';
import { useMouseDrawing } from './hooks/useMouseDrawing.js';
import { BRUSH } from './grid/editing.js';

export default function App() {
  const { grid, setGrid, start, setStart, end, setEnd, resetBoard, removeWalls, removeWeights } =
    useGrid();
  const [brush, setBrush] = useState(BRUSH.WALL);

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
