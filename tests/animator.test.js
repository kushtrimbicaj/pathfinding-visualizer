import { describe, expect, it } from 'vitest';
import { createAnimation } from '../src/animation/animator.js';
import { PATH_CLASS, VISITED_CLASS } from '../src/animation/paint.js';

/** Fake requestAnimationFrame: frames only run when the test calls frame(t). */
function fakeScheduler() {
  let pending = null;
  let nextId = 1;
  return {
    request(fn) {
      pending = { id: nextId++, fn };
      return pending.id;
    },
    cancel(id) {
      if (pending?.id === id) pending = null;
    },
    frame(time) {
      const p = pending;
      pending = null;
      p?.fn(time);
    },
    get hasPending() {
      return pending !== null;
    },
  };
}

const cells = (n, prefix) => Array.from({ length: n }, (_, i) => ({ id: `${prefix}${i}` }));

function setup({ visited = 10, path = 4, speed = { visited: 10, path: 4 } } = {}) {
  const result = { visitedInOrder: cells(visited, 'v'), path: cells(path, 'p') };
  const scheduler = fakeScheduler();
  const marks = [];
  const progress = [];
  let completed = 0;
  const anim = createAnimation(result, {
    speed,
    scheduler,
    mark: (cell, className) => marks.push(`${cell.id}:${className}`),
    onProgress: (p) => progress.push(p),
    onComplete: () => completed++,
  });
  return { anim, scheduler, marks, progress, completed: () => completed };
}

const countClass = (marks, className) => marks.filter((m) => m.endsWith(className)).length;

describe('createAnimation', () => {
  it('does nothing until started', () => {
    const { scheduler, marks } = setup();
    expect(scheduler.hasPending).toBe(false);
    expect(marks).toEqual([]);
  });

  it('reveals visited cells at the configured rate (cells per second)', () => {
    const { anim, scheduler, marks } = setup(); // 10 visited/s
    anim.start();
    scheduler.frame(1000); // first frame anchors the clock
    expect(marks).toHaveLength(0);
    scheduler.frame(1300); // 0.3s -> 3 cells
    expect(countClass(marks, VISITED_CLASS)).toBe(3);
    scheduler.frame(1500); // 0.5s -> 5 cells
    expect(countClass(marks, VISITED_CLASS)).toBe(5);
  });

  it('reveals visited cells in order, then the path in order', () => {
    const { anim, scheduler, marks } = setup({ visited: 3, path: 2, speed: { visited: 10, path: 10 } });
    anim.start();
    scheduler.frame(0);
    scheduler.frame(10_000); // finishes visited, path phase anchors here
    scheduler.frame(20_000);
    expect(marks).toEqual([
      `v0:${VISITED_CLASS}`,
      `v1:${VISITED_CLASS}`,
      `v2:${VISITED_CLASS}`,
      `p0:${PATH_CLASS}`,
      `p1:${PATH_CLASS}`,
    ]);
  });

  it('is independent of frame rate: same elapsed time, same cells', () => {
    const a = setup({ visited: 100 });
    const b = setup({ visited: 100 });
    a.anim.start();
    b.anim.start();
    a.scheduler.frame(0);
    b.scheduler.frame(0);
    for (let t = 16; t <= 1000; t += 16) a.scheduler.frame(t); // ~60 fps
    for (let t = 7; t <= 1000; t += 7) b.scheduler.frame(t); // ~144 fps
    a.scheduler.frame(1000);
    b.scheduler.frame(1000);
    expect(a.marks.length).toBe(10);
    expect(b.marks.length).toBe(10);
  });

  it('reveals several cells per frame when the rate demands it', () => {
    const { anim, scheduler, marks } = setup({ visited: 100, speed: { visited: 600, path: 1 } });
    anim.start();
    scheduler.frame(0);
    scheduler.frame(16); // 600/s * 0.016s = 9.6 -> 9 cells in one frame
    expect(marks).toHaveLength(9);
  });

  it('completes everything in one frame at Instant speed', () => {
    const { anim, scheduler, marks, completed } = setup({ speed: { visited: Infinity, path: Infinity } });
    anim.start();
    scheduler.frame(0);
    expect(marks).toHaveLength(14);
    expect(completed()).toBe(1);
    expect(scheduler.hasPending).toBe(false);
  });

  it('calls onComplete exactly once and stops scheduling', () => {
    const { anim, scheduler, completed, progress } = setup({ visited: 2, path: 1, speed: { visited: 100, path: 100 } });
    anim.start();
    scheduler.frame(0);
    scheduler.frame(1000);
    scheduler.frame(2000);
    expect(completed()).toBe(1);
    expect(anim.isRunning).toBe(false);
    expect(scheduler.hasPending).toBe(false);
    expect(progress[progress.length - 1]).toEqual({ phase: 'done', visited: 2, path: 1 });
  });

  it('finish() reveals all remaining cells immediately', () => {
    const { anim, scheduler, marks, completed } = setup();
    anim.start();
    scheduler.frame(0);
    scheduler.frame(200); // 2 cells so far
    anim.finish();
    expect(marks).toHaveLength(14);
    expect(new Set(marks).size).toBe(14); // nothing marked twice
    expect(completed()).toBe(1);
    expect(scheduler.hasPending).toBe(false);
    anim.finish(); // idempotent
    expect(completed()).toBe(1);
  });

  it('cancel() stops without completing', () => {
    const { anim, scheduler, marks, completed } = setup();
    anim.start();
    scheduler.frame(0);
    scheduler.frame(300);
    anim.cancel();
    scheduler.frame(5000);
    expect(marks).toHaveLength(3);
    expect(completed()).toBe(0);
    expect(scheduler.hasPending).toBe(false);
  });

  it('setSpeed() changes the rate mid-run without jumping', () => {
    const { anim, scheduler, marks } = setup({ visited: 1000, speed: { visited: 10, path: 1 } });
    anim.start();
    scheduler.frame(0);
    scheduler.frame(1000); // 10 cells at 10/s
    expect(marks).toHaveLength(10);
    anim.setSpeed({ visited: 100, path: 1 });
    scheduler.frame(1100); // re-anchors here: no catch-up burst
    expect(marks).toHaveLength(10);
    scheduler.frame(1600); // 0.5s at 100/s -> +50
    expect(marks).toHaveLength(60);
  });

  it('handles a result with no path (search only)', () => {
    const { anim, scheduler, marks, completed } = setup({ visited: 3, path: 0, speed: { visited: 10, path: 10 } });
    anim.start();
    scheduler.frame(0);
    scheduler.frame(1000);
    expect(countClass(marks, PATH_CLASS)).toBe(0);
    expect(completed()).toBe(1);
  });

  it('reports progress per frame', () => {
    const { anim, scheduler, progress } = setup();
    anim.start();
    scheduler.frame(0);
    scheduler.frame(400);
    expect(progress[progress.length - 1]).toEqual({ phase: 'visited', visited: 4, path: 0 });
  });
});
