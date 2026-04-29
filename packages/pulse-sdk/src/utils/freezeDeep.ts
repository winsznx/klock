export function freezeDeep<T extends object>(obj: T): T {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop as keyof T] === 'object' && obj[prop as keyof T] !== null) freezeDeep(obj[prop as keyof T] as any);
  });
  return Object.freeze(obj);
}
