import { useRef, useEffect, useCallback } from 'react';
export function useIsMountedStrict() {
  const isMounted = useRef(false);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);
  return useCallback(() => isMounted.current, []);
}
