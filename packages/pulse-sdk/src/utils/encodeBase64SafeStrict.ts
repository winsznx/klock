export function encodeBase64SafeStrict(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64');
}
