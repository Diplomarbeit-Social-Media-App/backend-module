export class ApiError extends Error {
  declare statusCode: number;
  declare isOperational: boolean;
  declare stack: string;
  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    stack
      ? (this.stack = stack)
      : Error.captureStackTrace(this, this.constructor);
  }
}
