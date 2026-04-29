export class StateMachine<S, E> { constructor(private state: S) {} transition(event: E, next: S) { this.state = next; } getState() { return this.state; } }
