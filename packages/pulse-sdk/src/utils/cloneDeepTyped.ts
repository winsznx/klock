export function cloneDeepTyped<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
