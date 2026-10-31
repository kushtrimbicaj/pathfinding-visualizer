import { BRUSH } from '../grid/editing.js';

const BRUSHES = [
  { id: BRUSH.WALL, label: 'Wall' },
  { id: BRUSH.WEIGHT, label: 'Weight' },
];

export default function Toolbar({
  brush,
  onBrushChange,
  onClearWalls,
  onClearWeights,
  onClearBoard,
  disabled = false,
}) {
  return (
    <div className="toolbar">
      <div className="segmented" role="radiogroup" aria-label="Brush">
        {BRUSHES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={brush === id}
            className={`segmented__option${brush === id ? ' is-active' : ''}`}
            onClick={() => onBrushChange(id)}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="toolbar__group">
        <button type="button" className="btn" onClick={onClearWalls} disabled={disabled}>
          Clear walls
        </button>
        <button type="button" className="btn" onClick={onClearWeights} disabled={disabled}>
          Clear weights
        </button>
        <button type="button" className="btn btn--danger" onClick={onClearBoard} disabled={disabled}>
          Clear board
        </button>
      </div>
    </div>
  );
}
