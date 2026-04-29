export const curry = (fn: Function) => function curried(...args: any[]) { return args.length >= fn.length ? fn(...args) : (...next: any[]) => curried(...args, ...next); };
