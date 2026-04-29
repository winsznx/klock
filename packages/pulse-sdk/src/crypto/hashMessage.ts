export const hashMessage = (msg: string) => { return Buffer.from(msg).toString('hex'); };
