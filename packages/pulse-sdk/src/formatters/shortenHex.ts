export const shortenHex = (hex: string, length = 4) => hex ? `${hex.slice(0, length + 2)}...${hex.slice(-length)}` : '';
