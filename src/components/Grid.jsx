import { memo } from 'react';
import Cell from './Cell.jsx';
import { colCount } from '../grid/gridUtils.js';

/**
 * A grid row. Because updateCell() copies only the changed row, every other
 * row keeps its array reference and this memo skips it entirely.
 */
const GridRow = memo(function GridRow({ cells, startCol, endCol }) {
  return (
    <div className="grid__row" role="row">
      {cells.map((cell) => (
        <Cell
          key={cell.col}
          cell={cell}
          isStart={cell.col === startCol}
          isEnd={cell.col === endCol}
        />
      ))}
    </div>
  );
});

export default function Grid({ grid, start, end }) {
  return (
    <div
      className="grid"
      role="grid"
      aria-label="Pathfinding grid"
      style={{ '--cols': colCount(grid) }}
    >
      {grid.map((cells, row) => (
        <GridRow
          key={row}
          cells={cells}
          // Pass -1 to rows without start/end so their props stay stable.
          startCol={start.row === row ? start.col : -1}
          endCol={end.row === row ? end.col : -1}
        />
      ))}
    </div>
  );
}
