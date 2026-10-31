import { HEAVY_WEIGHT } from '../grid/constants.js';

const ITEMS = [
  { className: 'cell--start', label: 'Start' },
  { className: 'cell--end', label: 'Destination' },
  { className: 'cell--wall', label: 'Wall' },
  { className: 'cell--weight', label: `Weight (cost ${HEAVY_WEIGHT})` },
  { className: 'cell--visited', label: 'Visited' },
  { className: 'cell--path', label: 'Path' },
  { className: 'cell--path-alt', label: 'BFS path (Run both)' },
];

export default function Legend() {
  return (
    <ul className="legend" aria-label="Legend">
      {ITEMS.map(({ className, label }) => (
        <li key={label} className="legend__item">
          <span className={`cell legend__swatch ${className}`} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
