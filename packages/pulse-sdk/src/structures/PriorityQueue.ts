export class PriorityQueue<T> {
  constructor(private items: {val: T, priority: number}[] = []) {}
  enqueue(val: T, priority: number) { this.items.push({val, priority}); this.items.sort((a, b) => a.priority - b.priority); }
  dequeue() { return this.items.shift()?.val; }
}
