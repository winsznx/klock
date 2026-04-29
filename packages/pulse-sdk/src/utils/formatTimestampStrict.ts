export function formatTimestampStrict(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
