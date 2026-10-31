import { bfs } from './bfs.js';

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
];

export const getAlgorithm = (id) => ALGORITHMS.find((a) => a.id === id) ?? ALGORITHMS[0];
