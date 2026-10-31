import { SPEEDS } from '../animation/speeds.js';

/** Stays enabled during a run: changing speed applies immediately. */
export default function SpeedControl({ speedId, onChange }) {
  return (
    <div className="field">
      <span className="field__label" id="speed-label">
        Speed
      </span>
      <div className="segmented" role="radiogroup" aria-labelledby="speed-label">
        {SPEEDS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={speedId === id}
            className={`segmented__option${speedId === id ? ' is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
