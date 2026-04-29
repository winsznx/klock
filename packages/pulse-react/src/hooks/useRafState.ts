import { useState, useCallback } from 'react';
export const useRafState = <T>(initial: T) => { const [val, set] = useState(initial); const setRaf = useCallback((v: T) => requestAnimationFrame(()=>set(v)), []); return [val, setRaf] as const; };
