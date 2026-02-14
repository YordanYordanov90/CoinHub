export type ErrorCode =
  | 'INTERNAL_ERROR'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'UPSTREAM_API_ERROR'
  | 'UPSTREAM_SERVER_ERROR';

export class APIError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    code: ErrorCode = 'INTERNAL_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class RateLimitError extends APIError {
  constructor(message = 'Rate limit reached', details?: unknown) {
    super(message, 429, true, 'RATE_LIMIT', details);
  }
}

export class NetworkError extends APIError {
  constructor(message = 'Network request failed', details?: unknown) {
    super(message, 503, true, 'NETWORK_ERROR', details);
  }
}

export class ValidationError extends APIError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}
