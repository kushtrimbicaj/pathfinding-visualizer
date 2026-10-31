/**
 * One-line summary of the last run. Phase 6 replaces this with the
 * side-by-side comparison panel.
 */
export default function ResultSummary({ run }) {
  if (!run) {
    return <p className="result result--idle">Pick an algorithm and press Visualize.</p>;
  }

  const { algorithm, result } = run;

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
