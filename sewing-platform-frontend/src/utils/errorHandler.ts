import { ApiError } from '../api/types';

/**
 * Default error messages for different error types
 */
const DEFAULT_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

/**
 * Maps HTTP status codes to user-friendly error messages
 * @param status HTTP status code
 * @returns User-friendly error message
 */
export const getErrorMessageForStatus = (status?: number): string => {
  if (!status) return DEFAULT_ERROR_MESSAGES.UNKNOWN_ERROR;
  
  switch (status) {
    case 400:
      return DEFAULT_ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return DEFAULT_ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return DEFAULT_ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return DEFAULT_ERROR_MESSAGES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return DEFAULT_ERROR_MESSAGES.SERVER_ERROR;
    default:
      return DEFAULT_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

/**
 * Format error message from API error
 * @param error API error object
 * @returns User-friendly error message
 */
export const formatApiError = (error: ApiError | unknown): string => {
  // Handle ApiError type
  if (typeof error === 'object' && error !== null && 'message' in error && 'code' in error) {
    const apiError = error as ApiError;
    
    // Return the API error message if available
    if (apiError.message) {
      return apiError.message;
    }
    
    // Check for error code
    if (apiError.code) {
      if (apiError.code === 'NETWORK_ERROR') {
        return DEFAULT_ERROR_MESSAGES.NETWORK_ERROR;
      }
      if (apiError.code === 'TIMEOUT_ERROR') {
        return DEFAULT_ERROR_MESSAGES.TIMEOUT_ERROR;
      }
    }
    
    // Check for status
    if ('status' in apiError && typeof apiError.status === 'number') {
      return getErrorMessageForStatus(apiError.status);
    }
  }
  
  // Handle Error type
  if (error instanceof Error) {
    return error.message || DEFAULT_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return error;
  }
  
  // Default error message
  return DEFAULT_ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Format validation errors from API
 * @param errors Validation errors from API
 * @returns Formatted error messages by field
 */
export const formatValidationErrors = (errors?: Record<string, string[]>): Record<string, string> => {
  if (!errors) return {};
  
  const formattedErrors: Record<string, string> = {};
  
  for (const [field, messages] of Object.entries(errors)) {
    if (messages && messages.length > 0) {
      formattedErrors[field] = messages[0];
    }
  }
  
  return formattedErrors;
};

/**
 * Handle API errors in a consistent way
 * @param error API error
 * @param callback Optional callback function
 * @returns Formatted error message and validation errors
 */
export const handleApiError = (
  error: ApiError | unknown,
  callback?: (message: string, validationErrors?: Record<string, string>) => void
): { message: string; validationErrors?: Record<string, string> } => {
  // Format error message
  const message = formatApiError(error);
  
  // Format validation errors if available
  let validationErrors: Record<string, string> | undefined;
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const apiError = error as ApiError;
    validationErrors = formatValidationErrors(apiError.errors);
  }
  
  // Execute callback if provided
  if (callback) {
    callback(message, validationErrors);
  }
  
  return { message, validationErrors };
}; 