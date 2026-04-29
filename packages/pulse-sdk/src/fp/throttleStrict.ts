export const throttleStrict = (fn: Function, ms: number) => { let last = 0; return (...args: any[]) => { const now = Date.now(); if(now - last >= ms) { fn(...args); last = now; } }; };
