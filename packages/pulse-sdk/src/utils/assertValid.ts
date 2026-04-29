export function assertValid(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Validation Failed: ${message}`);
}
