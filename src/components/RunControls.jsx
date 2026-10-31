import { ALGORITHMS } from '../algorithms/index.js';

export default function RunControls({
  algorithmId,
  onAlgorithmChange,
  onVisualize,
  onClearPath,
  onSkip,
  onStop,
  running,
}) {
  return (
    <div className="run-controls">
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
          <button type="button" className="btn" onClick={onClearPath}>
            Clear path
          </button>
        </>
      )}
    </div>
  );
}
