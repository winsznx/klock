export const percentage = (part: bigint, total: bigint, decimals: number = 2): number => Number((part * 10000n) / total) / 100;
