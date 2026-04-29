export const fromWei = (wei: bigint, decimals: number = 18): string => (Number(wei) / 10 ** decimals).toString();
