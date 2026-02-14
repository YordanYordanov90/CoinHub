import { ZodError } from 'zod';
import { APIError, ValidationError } from './index';
import { getErrorMessage } from './messages';

export interface FormattedError {
  code: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
  timestamp: string;
  details?: unknown;
}

function toErrorInstance(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : 'Unknown error');
}

export function handleAPIError(error: unknown): FormattedError {
  if (error instanceof ZodError) {
    const validation = new ValidationError('Response validation failed', error.issues);
    return {
      code: validation.code,
      message: getErrorMessage(validation.code),
      statusCode: validation.statusCode,
      isOperational: validation.isOperational,
      timestamp: validation.timestamp,
      details: validation.details,
    };
  }

  if (error instanceof APIError) {
    return {
      code: error.code,
      message: getErrorMessage(error.code),
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      timestamp: error.timestamp,
      details: error.details,
    };
  }

  const err = toErrorInstance(error);
  return {
    code: 'INTERNAL_ERROR',
    message: getErrorMessage('INTERNAL_ERROR'),
    statusCode: 500,
    isOperational: false,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  };
}

export function logError(error: Error, context?: object): void {
  if (process.env.NODE_ENV === 'production') {
    console.error('[error]', error.message, context ?? {});
    return;
  }
  console.error('[error]', error, context ?? {});
}

export function isClientError(error: { statusCode?: number } | unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const statusCode = (error as { statusCode?: number }).statusCode;
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500;
}

export function isServerError(error: { statusCode?: number } | unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const statusCode = (error as { statusCode?: number }).statusCode;
  return typeof statusCode === 'number' && statusCode >= 500;
}
