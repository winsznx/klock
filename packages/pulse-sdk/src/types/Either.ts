export type Left<L> = Readonly<{ _tag: 'Left'; left: L }>;
export type Right<R> = Readonly<{ _tag: 'Right'; right: R }>;
export type Either<L, R> = Left<L> | Right<R>;
export const left = <L>(l: L): Left<L> => ({ _tag: 'Left', left: l });
export const right = <R>(r: R): Right<R> => ({ _tag: 'Right', right: r });
