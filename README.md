# Pathfinding Visualizer

An interactive grid where you draw walls and weighted cells, then watch **Breadth-First Search** and **Dijkstra's algorithm** find a path between two points, step by step.

> 🚧 In progress. Phase 1 of 6 is complete (grid model and rendering).

## Why weighted cells?

On a grid where every move costs the same, BFS and Dijkstra find paths of equal length, so comparing them shows almost nothing. Weighted cells (cost 5) separate them:

- **BFS** finds the path with the **fewest steps** and ignores cost.
- **Dijkstra** finds the path with the **lowest total cost**, which may take more steps.

## Tech stack

- React 19 + Vite
- Plain CSS
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run unit tests
npm run build    # production build into dist/
```

## Project structure

```
src/
  algorithms/   BFS, Dijkstra, maze generation (pure functions, no React)
  animation/    playback engine (toggles CSS classes outside React)
  components/   Grid, Cell, Legend, toolbar and stats UI
  grid/         grid model, constants and immutable update helpers
  hooks/        React state hooks
tests/          unit tests
```

## Design notes

- **Start and end live in state, not on cells.** Dragging them never rebuilds the grid.
- **Row-level immutability.** Editing a cell copies only its row. Memoized rows and cells skip re-rendering untouched parts of the board.
- **Deterministic neighbour order** (up, right, down, left). The same board always animates the same way.

## Roadmap

1. ✅ Grid model and rendering
2. ⬜ Wall and weight drawing, start/end dragging, clear actions
3. ⬜ BFS and path reconstruction
4. ⬜ Binary min-heap and Dijkstra
5. ⬜ Step-by-step animation with adjustable speed
6. ⬜ Algorithm comparison stats, maze generation, deploy
