import { PulseError } from './PulseError.js';
export class TransactionError extends PulseError {
  public readonly txHash?: string;
  constructor(message: string, txHash?: string) {
    super(message, 'TRANSACTION_ERROR');
    this.txHash = txHash;
  }
}
