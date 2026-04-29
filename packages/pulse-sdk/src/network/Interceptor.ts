export interface Interceptor<T> { before?: (req: T) => T; after?: (res: any) => any; }
