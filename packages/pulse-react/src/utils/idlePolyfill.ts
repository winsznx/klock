export const requestIdleCallbackPolyfill = (cb: Function) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50) }), 1);
