export interface Transition<S, E> { from: S; event: E; to: S; action?: () => void; }
