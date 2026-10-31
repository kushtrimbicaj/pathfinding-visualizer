import Grid from './components/Grid.jsx';
import Legend from './components/Legend.jsx';
import { useGrid } from './hooks/useGrid.js';

export default function App() {
  const { grid, start, end, resetBoard } = useGrid();

  return (
    <div className="app">
      <header className="header">
        <div className="header__title">
          <h1>Pathfinding Visualizer</h1>
          <p>Draw walls and weights, then watch BFS and Dijkstra search for the shortest path.</p>
        </div>
        <div className="toolbar">
          <button type="button" className="btn" onClick={resetBoard}>
            Clear board
          </button>
        </div>
      </header>

      <Legend />

      <main className="board">
        <Grid grid={grid} start={start} end={end} />
      </main>
    </div>
  );
}
