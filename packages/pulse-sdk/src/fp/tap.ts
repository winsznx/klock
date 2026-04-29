export const tap = <T>(fn: (x: T)=>void) => (x: T): T => { fn(x); return x; };
