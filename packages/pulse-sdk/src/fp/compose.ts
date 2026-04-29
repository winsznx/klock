export const compose = <R>(...fns: Function[]) => (x: any): R => fns.reduceRight((acc, fn) => fn(acc), x);
