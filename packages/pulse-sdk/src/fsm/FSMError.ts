export class FSMError extends Error { constructor(msg: string) { super(msg); this.name = 'FSMError'; } }
