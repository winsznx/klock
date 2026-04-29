export const debounceStrict = (fn: Function, ms: number) => { let timer: any; return (...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };
