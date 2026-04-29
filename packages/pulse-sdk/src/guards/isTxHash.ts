export function isTxHash(value: unknown): value is string {
  return typeof value === 'string' && /^0x([A-Fa-f0-9]{64})$/.test(value);
}
