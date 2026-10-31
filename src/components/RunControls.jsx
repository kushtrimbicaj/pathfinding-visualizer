import { ALGORITHMS } from '../algorithms/index.js';

export default function RunControls({ algorithmId, onAlgorithmChange, onVisualize, onClearPath, disabled }) {
  return (
    <div className="run-controls">
      <label className="field">
        <span className="field__label">Algorithm</span>
        <select
          className="select"
          value={algorithmId}
          onChange={(e) => onAlgorithmChange(e.target.value)}
          disabled={disabled}
        >
          {ALGORITHMS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn btn--primary" onClick={onVisualize} disabled={disabled}>
        Visualize
      </button>
      <button type="button" className="btn" onClick={onClearPath} disabled={disabled}>
        Clear path
      </button>
    </div>
  );
}
