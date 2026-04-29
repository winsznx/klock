export class RingBuffer<T> {
  private buffer: T[];
  private index = 0;
  constructor(private capacity: number) { this.buffer = []; }
  push(item: T) { this.buffer[this.index] = item; this.index = (this.index + 1) % this.capacity; }
  get items() { return this.buffer; }
}
