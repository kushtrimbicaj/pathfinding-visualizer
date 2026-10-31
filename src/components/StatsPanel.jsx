import { ALGORITHMS } from '../algorithms/index.js';
import { METRICS, bestIds } from '../algorithms/compare.js';

const formatValue = (metric, value) => {
  if (value === null || value === undefined) return 'no path';
  return metric.format ? metric.format(value) : value.toLocaleString();
};

/**
 * Side-by-side comparison of every algorithm on the current board.
 * Always rendered (with dashes before a run) so the layout never jumps.
 * Results only appear once the animation has finished, so they don't spoil it.
 */
export default function StatsPanel({ entries, insight, showResults }) {
  const visible = showResults && entries;

  return (
    <section className="card stats" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="card__title">
        Comparison
      </h2>

      <table className="stats__table">
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">Metric</span>
            </th>
            {ALGORITHMS.map((a) => (
              <th key={a.id} scope="col">
                <span className="stats__algo">{a.shortName}</span>
                <span className="stats__guarantee">{a.guarantee}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => {
            const winners = visible ? bestIds(entries, metric) : new Set();
            return (
              <tr key={metric.id}>
                <th scope="row">
                  {metric.label}
                  {metric.unit && <span className="stats__unit"> ({metric.unit})</span>}
                </th>
                {ALGORITHMS.map((a) => {
                  const entry = visible && entries.find((e) => e.algorithm.id === a.id);
                  const isBest = winners.has(a.id);
                  return (
                    <td key={a.id} className={isBest ? 'is-best' : undefined}>
                      {entry ? formatValue(metric, metric.value(entry)) : '—'}
                      {isBest && <span className="visually-hidden"> (best)</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="stats__insight">
        {visible
          ? insight
          : 'Run an algorithm to compare how BFS and Dijkstra handle this board. Lower is better in every row.'}
      </p>
    </section>
  );
}
