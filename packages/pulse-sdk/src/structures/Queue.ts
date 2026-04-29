export class Queue<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.shift(); }
  get size() { return this.items.length; }
}
