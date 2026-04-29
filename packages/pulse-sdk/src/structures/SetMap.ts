export class SetMap<K, V> {
  private map = new Map<K, Set<V>>();
  add(key: K, val: V) { if (!this.map.has(key)) this.map.set(key, new Set()); this.map.get(key)!.add(val); }
  get(key: K): Set<V> { return this.map.get(key) || new Set(); }
}
