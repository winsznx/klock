export class PollManager { private timer: any; start(fn: Function, ms: number) { this.timer = setInterval(fn, ms); } stop() { clearInterval(this.timer); } }
