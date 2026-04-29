import { useRef, useEffect } from 'react';
export function usePreviousState<T>(value: T): T | undefined {
  const ref = useRef<T>(null);
  useEffect(() => { (ref.current as any) = value; }, [value]);
  return ref.current as T | undefined;
}
