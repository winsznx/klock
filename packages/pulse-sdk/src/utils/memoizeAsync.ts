export function memoizeAsync<T, Args extends any[]>(fn: (...args: Args) => Promise<T>, cacheKeyGen: (...args: Args) => string): (...args: Args) => Promise<T> {
  const cache = new Map<string, Promise<T>>();
  return (...args: Args) => {
    const key = cacheKeyGen(...args);
    if (cache.has(key)) return cache.get(key)!;
    const promise = fn(...args);
    cache.set(key, promise);
    return promise;
  };
}
