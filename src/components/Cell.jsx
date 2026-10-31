import { memo } from 'react';
import { cellId } from '../grid/gridUtils.js';
import { NORMAL_WEIGHT } from '../grid/constants.js';

/**
 * One grid square. Memoised: a cell only re-renders when its own data or role
 * changes. Visited/path colouring is added later by the animator via CSS
 * classes on this element (looked up by id), never through React state.
 */
function Cell({ cell, isStart, isEnd }) {
  const classes = ['cell'];
  if (isStart) classes.push('cell--start');
  else if (isEnd) classes.push('cell--end');
  else if (cell.isWall) classes.push('cell--wall');
  else if (cell.weight > NORMAL_WEIGHT) classes.push('cell--weight');

  const label = isStart ? 'Start' : isEnd ? 'Destination' : undefined;

  return (
    <div
      id={cellId(cell.row, cell.col)}
      className={classes.join(' ')}
      data-row={cell.row}
      data-col={cell.col}
      role="gridcell"
      aria-label={label}
    />
  );
}

export default memo(Cell);
