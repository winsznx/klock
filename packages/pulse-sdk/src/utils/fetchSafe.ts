import { left, right, type Either } from '../types/Either.js';
export async function fetchSafe(url: string, init?: RequestInit): Promise<Either<Error, Response>> {
  try { return right(await fetch(url, init)); } catch (e) { return left(e instanceof Error ? e : new Error(String(e))); }
}
