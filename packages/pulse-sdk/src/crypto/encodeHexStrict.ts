export const encodeHexStrict = (str: string) => Buffer.from(str, 'utf8').toString('hex');
