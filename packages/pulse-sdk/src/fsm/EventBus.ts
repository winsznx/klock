export class EventBus<E> { private subs = new Set<(e: E)=>void>(); on(cb: (e: E)=>void){ this.subs.add(cb); return ()=>this.subs.delete(cb); } emit(e: E){ this.subs.forEach(cb=>cb(e)); } }
