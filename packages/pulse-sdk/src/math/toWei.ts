export const toWei = (amount: string | number, decimals: number = 18): bigint => BigInt(Math.floor(Number(amount) * 10 ** decimals));
