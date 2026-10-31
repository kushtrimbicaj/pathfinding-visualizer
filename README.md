# Pathfinding Visualizer

An interactive grid where you draw walls and weighted cells, then watch **Breadth-First Search** and **Dijkstra's algorithm** find a path between two points, step by step.

> 🚧 In progress. Phase 5 of 6 is complete (step-by-step animation).

## Controls

- **Click and drag** to draw with the selected brush (Wall or Weight).
- **Start a stroke on a wall or weight** to erase that type instead.
- **Hold Shift** while drawing to place weights with any brush selected.
- **Drag the green and red squares** to move the start and destination.
- **Clear walls / Clear weights / Clear board** reset parts of the grid.
- **Visualize** plays the search step by step. Editing is locked while it runs.
- **Speed** (Slow, Medium, Fast, Instant) can be changed mid-run.
- **Skip to end** finishes immediately. **Stop** or **Esc** cancels.

## Why weighted cells?

On a grid where every move costs the same, BFS and Dijkstra find paths of equal length, so comparing them shows almost nothing. Weighted cells (cost 5) separate them:

- **BFS** finds the path with the **fewest steps** and ignores cost.
- **Dijkstra** finds the path with the **lowest total cost**, which may take more steps.

Example: put 14 weights on the direct route. BFS walks straight through them (26 steps, cost 82). Dijkstra steps up one row and goes around (28 steps, cost 28).

## Algorithms

| | BFS | Dijkstra |
|---|---|---|
| Guarantees | Fewest steps | Lowest total cost |
| Uses weights | No | Yes |
| Frontier | FIFO queue | Binary min-heap |
| Time | O(V + E) | O((V + E) log V) |

Moving into a cell costs that cell's weight (1 normally, 5 for weighted cells). The start cell isn't counted.

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
- **Event delegation with Pointer Events.** One set of handlers on the grid instead of ~1,000 per-cell handlers. Works with mouse, touch and pen.
- **Gap-free strokes.** Pointer events fire at a limited rate, so a fast drag can skip cells. Bresenham's line algorithm fills in every cell between two events.
- **One result shape for every algorithm.** Each algorithm is a pure function `(grid, start, end) → { found, visitedInOrder, path, steps, cost }`. The renderer and stats never need to know which algorithm ran.
- **O(1) queue for BFS.** An array with a head index instead of `Array.shift()`, which re-indexes the whole array on every call and makes BFS quadratic.
- **Hand-written binary min-heap** for Dijkstra, with lazy deletion instead of decrease-key: when a cell's distance improves, a new entry is pushed and the stale one is skipped when popped. Ties break by insertion order, so the search is deterministic and expands like BFS on unweighted grids.
- **Tested against a reference solver.** Dijkstra's cost is checked on 200 seeded random grids against a slow but obviously correct Bellman-Ford-style solver, along with checks that it never costs more than BFS and BFS never takes more steps.
- **Compute first, then animate.** The algorithm runs to completion instantly and returns the visit order. The animator then replays it. The algorithms stay pure and testable, and the stats are known before playback starts.
- **Animation outside React.** The animator (`src/animation/animator.js`) is framework-free. It adds CSS classes directly to cell elements, so animating 800 cells causes zero React re-renders of the grid.
- **Time-based playback.** Speeds are in cells per second, not "ms per cell". Each `requestAnimationFrame` reveals however many cells are due by now. Playback looks the same at 60 Hz and 144 Hz, can reveal several cells per frame, and re-anchors its clock when the speed changes so there's no jump.
- **Tested with a fake clock.** The scheduler and DOM-marking function are injected, so the animator's tests drive frames with exact timestamps, including frame-rate independence, mid-run speed changes, skip and cancel.
- **Pure editing logic.** Brush rules (draw vs erase, walls replacing weights, protecting start/end) live in `src/grid/editing.js` and are unit-tested without a browser.

## Roadmap

1. ✅ Grid model and rendering
2. ✅ Wall and weight drawing, start/end dragging, clear actions
3. ✅ BFS and path reconstruction
4. ✅ Binary min-heap and Dijkstra
5. ✅ Step-by-step animation with adjustable speed
6. ⬜ Algorithm comparison stats, maze generation, deploy
