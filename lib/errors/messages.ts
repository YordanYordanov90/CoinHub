import type { ErrorCode } from './index';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait and try again.',
  NETWORK_ERROR: 'Network issue while contacting the upstream service.',
  VALIDATION_ERROR: 'Received unexpected data format from upstream service.',
  BAD_REQUEST: 'Invalid request parameters.',
  UNAUTHORIZED: 'Authentication failed for upstream service.',
  NOT_FOUND: 'Requested resource was not found.',
  UPSTREAM_API_ERROR: 'Upstream API request failed.',
  UPSTREAM_SERVER_ERROR: 'Upstream service is temporarily unavailable.',
};

export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode as ErrorCode] ?? ERROR_MESSAGES.INTERNAL_ERROR;
}
