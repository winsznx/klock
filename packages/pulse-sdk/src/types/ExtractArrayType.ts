export type ExtractArrayType<T> = T extends readonly (infer U)[] ? U : never;
