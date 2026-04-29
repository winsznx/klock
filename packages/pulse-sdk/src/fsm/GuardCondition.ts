export type GuardCondition<C, E> = (context: C, event: E) => boolean;
