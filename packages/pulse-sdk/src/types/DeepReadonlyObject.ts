export type DeepReadonlyObject<T> = T extends Function ? T : T extends object ? { readonly [K in keyof T]: DeepReadonlyObject<T[K]> } : T;
