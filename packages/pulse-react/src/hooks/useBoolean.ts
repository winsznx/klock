import { useState, useCallback } from 'react';
export function useBoolean(initial: boolean = false) {
  const [value, setValue] = useState(initial);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);
  return { value, setValue, setTrue, setFalse, toggle };
}
