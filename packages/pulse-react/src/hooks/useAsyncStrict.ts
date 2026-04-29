import { useState, useEffect, useCallback } from 'react';
export function useAsyncStrict<T>(asyncFn: () => Promise<T>, immediate = true) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const execute = useCallback(() => {
    setStatus('pending'); setValue(null); setError(null);
    return asyncFn().then(response => { setValue(response); setStatus('success'); }).catch(error => { setError(error); setStatus('error'); });
  }, [asyncFn]);
  useEffect(() => { if (immediate) execute(); }, [execute, immediate]);
  return { execute, status, value, error };
}
