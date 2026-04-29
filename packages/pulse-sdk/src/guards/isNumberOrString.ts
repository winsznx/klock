export function isNumberOrString(value: unknown): value is number | string {
  return typeof value === 'number' || typeof value === 'string';
}
