export const decodeHexStrict = (hex: string) => Buffer.from(hex, 'hex').toString('utf8');
