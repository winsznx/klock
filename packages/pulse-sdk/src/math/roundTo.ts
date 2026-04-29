export const roundTo = (num: number, places: number): number => { const factor = 10 ** places; return Math.round(num * factor) / factor; };
