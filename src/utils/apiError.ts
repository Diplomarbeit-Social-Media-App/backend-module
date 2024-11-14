export class ApiError extends Error {
  declare statusCode: number;
  declare isOperational: boolean;
  declare stack: string;
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'APIError';
    this.stack = stack;
    if (!this.stack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
