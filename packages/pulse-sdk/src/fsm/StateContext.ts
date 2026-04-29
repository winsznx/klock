export class StateContext<C> { constructor(public context: C) {} update(patch: Partial<C>) { Object.assign(this.context, patch); } }
