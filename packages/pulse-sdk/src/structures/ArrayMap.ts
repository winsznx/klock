export class ArrayMap<K, V> {
  private map = new Map<K, V[]>();
  push(key: K, val: V) { if (!this.map.has(key)) this.map.set(key, []); this.map.get(key)!.push(val); }
  get(key: K): V[] { return this.map.get(key) || []; }
}
