import { useEffect, useRef } from 'react';
export function useEventListener(eventName: string, handler: Function, element: any = window) {
  const savedHandler = useRef<Function | null>(null);
  useEffect(() => { savedHandler.current = handler; }, [handler]);
  useEffect(() => {
    if (!element || !element.addEventListener) return;
    const eventListener = (e: Event) => savedHandler.current!(e);
    element.addEventListener(eventName, eventListener);
    return () => element.removeEventListener(eventName, eventListener);
  }, [eventName, element]);
}
