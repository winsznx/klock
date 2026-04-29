export function rateLimitAsync<T, Args extends any[]>(fn: (...args: Args) => Promise<T>, delayMs: number): (...args: Args) => Promise<T> {
  let lastCall = 0;
  return async (...args: Args) => {
    const now = Date.now();
    if (now - lastCall < delayMs) { await new Promise(res => setTimeout(res, delayMs - (now - lastCall))); }
    lastCall = Date.now();
    return fn(...args);
  };
}
