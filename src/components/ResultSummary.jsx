import { samePath } from '../algorithms/compare.js';

/** One-line status above the grid: what is playing, or what is shown. */
export default function ResultSummary({ run, status, progress }) {
  if (!run || status === 'idle') {
    return (
      <p className="result result--idle">
        Press <strong>Visualize</strong> to watch one algorithm, or <strong>Run both</strong> to
        compare them on the same board.
      </p>
    );
  }

  if (status === 'running') {
    const tracing = progress?.phase === 'path';
    return (
      <p className="result result--running" role="status" aria-live="off">
        <strong>{progress?.label}</strong>: {tracing ? 'tracing path' : 'searching'}… visited{' '}
        <b>{progress?.visited ?? 0}</b> cells
      </p>
    );
  }

  if (run.mode === 'both') {
    const [first, second] = run.entries;
    if (!second.result.found) {
      return (
        <p className="result result--fail" role="status">
          <strong>No path</strong>: neither algorithm can reach the destination.
        </p>
      );
    }
    const identical = samePath(first.result, second.result);
    return (
      <p className="result" role="status">
        Showing <strong>{second.algorithm.shortName}</strong>&apos;s search.{' '}
        {identical ? (
          <>Both algorithms chose the same path.</>
        ) : (
          <>
            <span className="key key--path" aria-hidden="true" /> {second.algorithm.shortName}{' '}
            path · <span className="key key--alt" aria-hidden="true" /> {first.algorithm.shortName}{' '}
            path
          </>
        )}
      </p>
    );
  }

  const { algorithm, result } = run.entries.find((e) => e.algorithm.id === run.primaryId);

  if (!result.found) {
    return (
      <p className="result result--fail" role="status">
        <strong>{algorithm.shortName}</strong>: no path. Visited {result.visitedInOrder.length} cells
        before running out of options.
      </p>
    );
  }

  return (
    <p className="result" role="status">
      <strong>{algorithm.shortName}</strong>: visited <b>{result.visitedInOrder.length}</b> cells ·
      path <b>{result.steps}</b> steps · cost <b>{result.cost}</b>
    </p>
  );
}
