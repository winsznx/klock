export function assertNever(value: never): never {
    throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
