export const pipe = <R>(...fns: Function[]) => (x: any): R => fns.reduce((acc, fn) => fn(acc), x);
