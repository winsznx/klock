export class RpcBatcher<T> { private queue: T[] = []; add(req: T) { this.queue.push(req); } flush() { const batch = [...this.queue]; this.queue = []; return batch; } }
