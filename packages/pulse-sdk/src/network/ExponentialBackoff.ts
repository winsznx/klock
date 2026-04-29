export const getBackoffDelay = (attempt: number, base = 1000) => base * Math.pow(2, attempt);
