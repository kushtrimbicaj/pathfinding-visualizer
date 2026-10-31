/**
 * Binary min-heap priority queue.
 *
 * Stored as a flat array where the children of index i are 2i+1 and 2i+2.
 * push and pop are O(log n), peek is O(1). Re-sorting an array on every
 * step instead would make Dijkstra O(V² log V).
 *
 * @template T
 */
export class MinHeap {
  /** @param {(a: T, b: T) => number} compare negative if a should come out before b */
  constructor(compare = (a, b) => a - b) {
    this.compare = compare;
    /** @type {T[]} */
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  /** @returns {T | undefined} */
  peek() {
    return this.items[0];
  }

  /** @param {T} item */
  push(item) {
    this.items.push(item);
    this.#siftUp(this.items.length - 1);
  }

  /** Removes and returns the smallest item, or undefined if empty. */
  pop() {
    const { items } = this;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  #siftUp(index) {
    const { items, compare } = this;
    const item = items[index];
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (compare(item, items[parent]) >= 0) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = item;
  }

  #siftDown(index) {
    const { items, compare } = this;
    const length = items.length;
    const item = items[index];
    for (;;) {
      const left = 2 * index + 1;
      if (left >= length) break;
      const right = left + 1;
      const child = right < length && compare(items[right], items[left]) < 0 ? right : left;
      if (compare(items[child], item) >= 0) break;
      items[index] = items[child];
      index = child;
    }
    items[index] = item;
  }
}
