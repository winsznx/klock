export class HistoryState<S> { private history: S[] = []; push(s: S) { this.history.push(s); } pop() { return this.history.pop(); } }
