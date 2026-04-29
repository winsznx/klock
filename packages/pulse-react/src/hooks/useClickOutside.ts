import { useEffect, RefObject } from 'react';
export function useClickOutside(ref: RefObject<HTMLElement>, handler: (e: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => { if (!ref.current || ref.current.contains(event.target as Node)) return; handler(event); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
