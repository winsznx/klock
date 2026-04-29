export const once = <T extends Function>(fn: T): T => { let called = false, res: any; return ((...args: any[]) => { if(called) return res; called = true; res = fn(...args); return res; }) as any; };
