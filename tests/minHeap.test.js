import { describe, expect, it } from 'vitest';
import { MinHeap } from '../src/algorithms/MinHeap.js';
import { mulberry32 } from './helpers.js';

describe('MinHeap', () => {
  it('starts empty', () => {
    const heap = new MinHeap();
    expect(heap.size).toBe(0);
    expect(heap.isEmpty()).toBe(true);
    expect(heap.pop()).toBe(undefined);
    expect(heap.peek()).toBe(undefined);
  });

  it('pops numbers in ascending order', () => {
    const heap = new MinHeap();
    [5, 3, 8, 1, 9, 2, 7].forEach((n) => heap.push(n));
    expect(heap.peek()).toBe(1);
    const out = [];
    while (!heap.isEmpty()) out.push(heap.pop());
    expect(out).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it('handles duplicates', () => {
    const heap = new MinHeap();
    [2, 1, 2, 1, 2].forEach((n) => heap.push(n));
    const out = [];
    while (heap.size) out.push(heap.pop());
    expect(out).toEqual([1, 1, 2, 2, 2]);
  });

  it('matches a sort on 1,000 random values, with pushes and pops interleaved', () => {
    const rand = mulberry32(42);
    const heap = new MinHeap();
    const reference = [];
    for (let i = 0; i < 1000; i++) {
      const n = Math.floor(rand() * 500);
      heap.push(n);
      reference.push(n);
      if (i % 3 === 0) {
        reference.sort((a, b) => a - b);
        expect(heap.pop()).toBe(reference.shift());
      }
    }
    reference.sort((a, b) => a - b);
    const rest = [];
    while (heap.size) rest.push(heap.pop());
    expect(rest).toEqual(reference);
  });

  it('supports a custom comparator with stable tie-breaking', () => {
    const heap = new MinHeap((a, b) => a.dist - b.dist || a.seq - b.seq);
    heap.push({ id: 'a', dist: 2, seq: 0 });
    heap.push({ id: 'b', dist: 1, seq: 1 });
    heap.push({ id: 'c', dist: 2, seq: 2 });
    heap.push({ id: 'd', dist: 1, seq: 3 });
    const ids = [];
    while (heap.size) ids.push(heap.pop().id);
    expect(ids).toEqual(['b', 'd', 'a', 'c']);
  });
});
