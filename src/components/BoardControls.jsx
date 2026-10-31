import { BRUSH } from '../grid/editing.js';

const BRUSHES = [
  { id: BRUSH.WALL, label: 'Wall' },
  { id: BRUSH.WEIGHT, label: 'Weight' },
];

/** Everything that edits the board: brush, generators and clear actions. */
export default function BoardControls({
  brush,
  onBrushChange,
  onMaze,
  onRandomWalls,
  onRandomWeights,
  onClearWalls,
  onClearWeights,
  onClearBoard,
  disabled = false,
}) {
  return (
    <section className="card" aria-labelledby="board-heading">
      <h2 id="board-heading" className="card__title">
        Board
      </h2>

      <div className="control-row">
        <span className="field__label" id="brush-label">
          Brush
        </span>
        <div className="segmented" role="radiogroup" aria-labelledby="brush-label">
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
      </div>

      <div className="control-row">
        <span className="field__label">Generate</span>
        <button type="button" className="btn" onClick={onMaze} disabled={disabled}>
          Maze
        </button>
        <button type="button" className="btn" onClick={onRandomWalls} disabled={disabled}>
          Random walls
        </button>
        <button type="button" className="btn" onClick={onRandomWeights} disabled={disabled}>
          Random weights
        </button>
      </div>

      <div className="control-row">
        <span className="field__label">Clear</span>
        <button type="button" className="btn" onClick={onClearWalls} disabled={disabled}>
          Walls
        </button>
        <button type="button" className="btn" onClick={onClearWeights} disabled={disabled}>
          Weights
        </button>
        <button type="button" className="btn btn--danger" onClick={onClearBoard} disabled={disabled}>
          Everything
        </button>
      </div>
    </section>
  );
}
