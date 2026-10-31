import { bfs } from './bfs.js';
import { dijkstra } from './dijkstra.js';

/**
 * Registry of available algorithms. The UI builds its picker from this list,
 * so adding an algorithm only means adding an entry here.
 */
export const ALGORITHMS = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    shortName: 'BFS',
    weighted: false,
    guarantee: 'Fewest steps (ignores weights)',
    run: bfs,
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    shortName: 'Dijkstra',
    weighted: true,
    guarantee: 'Lowest total cost',
    run: dijkstra,
  },
];

export const getAlgorithm = (id) => ALGORITHMS.find((a) => a.id === id) ?? ALGORITHMS[0];
