import { useAsyncStrict } from './useAsyncStrict.js';
export function useFetch<T>(url: string, options?: RequestInit) {
  return useAsyncStrict<T>(async () => {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Network error');
    return res.json();
  });
}
