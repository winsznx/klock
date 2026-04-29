import { PulseError } from './PulseError.js';
export class RpcError extends PulseError {
  public readonly method: string;
  constructor(message: string, method: string) {
    super(message, 'RPC_ERROR');
    this.method = method;
  }
}
