export class CircuitBreaker { failures = 0; constructor(public threshold: number) {} recordFailure() { this.failures++; } isOpen() { return this.failures >= this.threshold; } }
