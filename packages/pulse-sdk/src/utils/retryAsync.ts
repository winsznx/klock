export async function retryAsync<T>(fn: () => Promise<T>, retries: number = 3, delayMs: number = 1000): Promise<T> {
  try { return await fn(); } catch (error) {
    if (retries <= 1) throw error;
    await new Promise(res => setTimeout(res, delayMs));
    return retryAsync(fn, retries - 1, delayMs * 2);
  }
}
