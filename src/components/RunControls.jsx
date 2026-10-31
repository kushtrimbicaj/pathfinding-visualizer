import { ALGORITHMS } from '../algorithms/index.js';
import SpeedControl from './SpeedControl.jsx';

/** Choosing and playing algorithms. */
export default function RunControls({
  algorithmId,
  onAlgorithmChange,
  onVisualize,
  onRunBoth,
  onClearPath,
  onSkip,
  onStop,
  speedId,
  onSpeedChange,
  running,
}) {
  return (
    <section className="card" aria-labelledby="run-heading">
      <h2 id="run-heading" className="card__title">
        Run
      </h2>

      <div className="control-row">
        <label className="field">
          <span className="field__label">Algorithm</span>
          <select
            className="select"
            value={algorithmId}
            onChange={(e) => onAlgorithmChange(e.target.value)}
            disabled={running}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="control-row">
        {running ? (
          <>
            <button type="button" className="btn btn--primary" onClick={onSkip}>
              Skip to end
            </button>
            <button type="button" className="btn" onClick={onStop}>
              Stop
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--primary" onClick={onVisualize}>
              Visualize
            </button>
            <button
              type="button"
              className="btn"
              onClick={onRunBoth}
              title="Animate BFS, then Dijkstra on the same board"
            >
              Run both
            </button>
            <button type="button" className="btn" onClick={onClearPath}>
              Clear path
            </button>
          </>
        )}
      </div>

      <div className="control-row">
        <SpeedControl speedId={speedId} onChange={onSpeedChange} />
      </div>
    </section>
  );
}
