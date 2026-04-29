import { useEffect } from 'react';
export function useIdleTask(task: () => void) {
  useEffect(() => {
    if ('requestIdleCallback' in window) { const id = (window as any).requestIdleCallback(task); return () => (window as any).cancelIdleCallback(id); }
    else { const id = setTimeout(task, 1); return () => clearTimeout(id); }
  }, [task]);
}
