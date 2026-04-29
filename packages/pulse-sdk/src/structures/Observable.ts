export class Observable<T> {
  constructor(private value: T) {}
  private observers: ((val: T) => void)[] = [];
  subscribe(fn: (val: T) => void) { this.observers.push(fn); }
  set(val: T) { this.value = val; this.observers.forEach(fn => fn(val)); }
  get() { return this.value; }
}
