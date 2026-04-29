import { left, right, type Either } from '../types/Either.js';
export function parseSafe<T>(json: string): Either<Error, T> {
  try { return right(JSON.parse(json) as T); } catch (e) { return left(e instanceof Error ? e : new Error(String(e))); }
}
