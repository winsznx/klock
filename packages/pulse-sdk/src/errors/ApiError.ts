import { PulseError } from './PulseError.js';
export class ApiError extends PulseError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'API_ERROR', statusCode);
  }
}
