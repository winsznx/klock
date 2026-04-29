export const delayP = (ms: number) => <T>(val: T): Promise<T> => new Promise(res => setTimeout(() => res(val), ms));
