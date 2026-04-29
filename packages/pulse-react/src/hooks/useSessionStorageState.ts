import { useState } from 'react';
export function useSessionStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const item = window.sessionStorage.getItem(key); return item ? JSON.parse(item) : initial; } catch { return initial; }
  });
  const setStoredValue = (val: T) => { setValue(val); window.sessionStorage.setItem(key, JSON.stringify(val)); };
  return [value, setStoredValue] as const;
}
