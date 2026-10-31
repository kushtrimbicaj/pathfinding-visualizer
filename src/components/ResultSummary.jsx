/**
 * One-line status for the current run. Phase 6 adds the side-by-side
 * comparison panel next to it.
 */
export default function ResultSummary({ run, status, progress }) {
  if (!run || status === 'idle') {
    return <p className="result result--idle">Pick an algorithm and press Visualize.</p>;
  }

  const { algorithm, result } = run;

  if (status === 'running') {
    const tracing = progress?.phase === 'path';
    return (
      <p className="result result--running" role="status" aria-live="off">
        <strong>{algorithm.shortName}</strong>:{' '}
        {tracing ? 'tracing path' : 'searching'}… visited <b>{progress?.visited ?? 0}</b> cells
      </p>
    );
  }

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
