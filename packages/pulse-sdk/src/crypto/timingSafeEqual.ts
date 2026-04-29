export const timingSafeEqual = (a: string, b: string) => { let res = 0; for(let i=0; i<Math.max(a.length, b.length); i++) res |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0); return res === 0; };
