export type Just<T> = Readonly<{ _tag: 'Just'; value: T }>;
export type Nothing = Readonly<{ _tag: 'Nothing' }>;
export type Maybe<T> = Just<T> | Nothing;
export const just = <T>(value: T): Just<T> => ({ _tag: 'Just', value });
export const nothing = (): Nothing => ({ _tag: 'Nothing' });
