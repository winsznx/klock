import type { Address } from 'viem';

export function isAddress(address: unknown): address is Address {
    return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}
