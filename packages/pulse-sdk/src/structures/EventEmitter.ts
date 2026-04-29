export class EventEmitter<T extends Record<string, any>> {
  private events = new Map<keyof T, Function[]>();
  on<K extends keyof T>(event: K, listener: (arg: T[K]) => void) { const list = this.events.get(event) || []; list.push(listener); this.events.set(event, list); }
  emit<K extends keyof T>(event: K, arg: T[K]) { const list = this.events.get(event); if (list) list.forEach(cb => cb(arg)); }
}
