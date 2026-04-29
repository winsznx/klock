export type DeepPartialObject<T> = T extends Function ? T : T extends object ? { [K in keyof T]?: DeepPartialObject<T[K]> } : T;
