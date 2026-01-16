/**
 * Frontend Error Utilities
 *
 * Type-safe utilities for parsing and handling tRPC errors on the frontend.
 * This module provides functions to extract user-friendly messages and
 * validation errors from tRPC error responses.
 *
 * ## Usage
 *
 * ```typescript
 * import { parseApiError, getFieldErrors, isValidationError } from '@pkg/trpc/errors';
 *
 * try {
 *   await mutation.mutateAsync(data);
 * } catch (error) {
 *   const parsed = parseApiError(error);
 *
 *   // Show user message
 *   toast.error(parsed.message);
 *
 *   // Handle validation errors
 *   if (parsed.validationErrors) {
 *     const fieldErrors = getFieldErrors(parsed.validationErrors);
 *     // Set form errors
 *     Object.entries(fieldErrors).forEach(([field, message]) => {
 *       form.setError(field, { message });
 *     });
 *   }
 * }
 * ```
 */

import type { ErrorCodeType } from "./error-codes";

// ============================================================================
// Types
// ============================================================================

/**
 * Validation error for a specific field
 */
export interface ClientValidationError {
  field: string;
  message: string;
}

/**
 * Parsed error structure from API responses
 */
export interface ParsedApiError {
  /** Our application error code */
  code: ErrorCodeType | string;
  /** User-friendly message to display */
  message: string;
  /** Field-level validation errors (if any) */
  validationErrors?: ClientValidationError[];
  /** Request ID for support tickets */
  requestId?: string;
  /** When the error occurred */
  timestamp?: string;
  /** HTTP status code */
  httpStatus?: number;
  /** Whether this is a network error */
  isNetworkError: boolean;
  /** The original error object */
  originalError: unknown;
}

/**
 * Shape of tRPC client error data (duck-typed for compatibility)
 */
interface TRPCClientErrorLike {
  data?: {
    errorCode?: string;
    userMessage?: string;
    validationErrors?: ClientValidationError[];
    requestId?: string;
    timestamp?: string;
    httpStatus?: number;
    code?: string;
  };
  message?: string;
  name?: string;
}

// ============================================================================
// Error Detection
// ============================================================================

/**
 * Check if an error looks like a TRPCClientError
 * Uses duck-typing to avoid dependency on @trpc/client
 */
function isTRPCClientErrorLike(error: unknown): error is TRPCClientErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    (error as any).name === "TRPCClientError"
  );
}

// ============================================================================
// Error Parsing
// ============================================================================

/**
 * Default message for unknown errors
 */
const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Message for network errors
 */
const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Please check your internet connection.";

/**
 * Parse any error into a structured format for UI display
 *
 * This function handles:
 * - TRPCClientError with our custom error data
 * - Network errors (fetch failed)
 * - Unknown error types
 *
 * @param error - Any error caught from an API call
 * @returns Parsed error with user-friendly message
 */
export function parseApiError(error: unknown): ParsedApiError {
  // Network/connection error
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      code: "NETWORK_ERROR",
      message: NETWORK_ERROR_MESSAGE,
      isNetworkError: true,
      originalError: error,
    };
  }

  // tRPC error with our custom data (duck-typed check)
  if (isTRPCClientErrorLike(error)) {
    const data = error.data;

    return {
      code: data?.errorCode || data?.code || "UNKNOWN_ERROR",
      message: data?.userMessage || error.message || DEFAULT_ERROR_MESSAGE,
      validationErrors: data?.validationErrors,
      requestId: data?.requestId,
      timestamp: data?.timestamp,
      httpStatus: data?.httpStatus,
      isNetworkError: false,
      originalError: error,
    };
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message || DEFAULT_ERROR_MESSAGE,
      isNetworkError: false,
      originalError: error,
    };
  }

  // String error
  if (typeof error === "string") {
    return {
      code: "UNKNOWN_ERROR",
      message: error || DEFAULT_ERROR_MESSAGE,
      isNetworkError: false,
      originalError: error,
    };
  }

  // Unknown type
  return {
    code: "UNKNOWN_ERROR",
    message: DEFAULT_ERROR_MESSAGE,
    isNetworkError: false,
    originalError: error,
  };
}

// ============================================================================
// Validation Error Helpers
// ============================================================================

/**
 * Convert validation errors array to a field -> message map
 *
 * @param errors - Array of validation errors
 * @returns Object with field names as keys and error messages as values
 *
 * @example
 * const fieldErrors = getFieldErrors(parsed.validationErrors);
 * // { email: "Invalid email format", password: "Password is required" }
 */
export function getFieldErrors(
  errors?: ClientValidationError[]
): Record<string, string> {
  if (!errors) return {};

  return errors.reduce(
    (acc, error) => {
      acc[error.field] = error.message;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Get error message for a specific field
 *
 * @param errors - Array of validation errors
 * @param fieldName - Name of the field to get error for
 * @returns Error message or undefined
 */
export function getFieldError(
  errors: ClientValidationError[] | undefined,
  fieldName: string
): string | undefined {
  return errors?.find((e) => e.field === fieldName)?.message;
}

/**
 * Check if there are any validation errors
 */
export function hasValidationErrors(error: ParsedApiError): boolean {
  return (error.validationErrors?.length ?? 0) > 0;
}

// ============================================================================
// Error Type Checks
// ============================================================================

/**
 * Check if an error is a validation error
 */
export function isValidationErrorResponse(error: ParsedApiError): boolean {
  return (
    error.code.startsWith("VALIDATION_") ||
    (error.validationErrors?.length ?? 0) > 0
  );
}

/**
 * Check if an error is an authentication error
 */
export function isAuthErrorResponse(error: ParsedApiError): boolean {
  return (
    error.code.startsWith("AUTH_") ||
    error.httpStatus === 401 ||
    error.httpStatus === 403
  );
}

/**
 * Check if the user needs to log in again
 */
export function requiresReauthentication(error: ParsedApiError): boolean {
  return (
    error.code === "AUTH_SESSION_EXPIRED" ||
    error.code === "AUTH_TOKEN_EXPIRED" ||
    error.code === "AUTH_TOKEN_INVALID" ||
    error.code === "AUTH_UNAUTHORIZED"
  );
}

/**
 * Check if an error is a "not found" error
 */
export function isNotFoundError(error: ParsedApiError): boolean {
  return error.code === "RESOURCE_NOT_FOUND" || error.httpStatus === 404;
}

/**
 * Check if an error is a server error (something we should report)
 */
export function isServerError(error: ParsedApiError): boolean {
  return (error.httpStatus ?? 0) >= 500;
}

// ============================================================================
// Error Display Helpers
// ============================================================================

/**
 * Get a user-friendly error title based on error type
 */
export function getErrorTitle(error: ParsedApiError): string {
  if (error.isNetworkError) return "Connection Error";
  if (isValidationErrorResponse(error)) return "Validation Error";
  if (isAuthErrorResponse(error)) return "Authentication Required";
  if (isNotFoundError(error)) return "Not Found";
  if (isServerError(error)) return "Server Error";
  return "Error";
}

/**
 * Format a support ticket message with error details
 */
export function formatSupportMessage(error: ParsedApiError): string {
  const lines = [
    `Error Code: ${error.code}`,
    `Message: ${error.message}`,
    `Timestamp: ${error.timestamp || new Date().toISOString()}`,
  ];

  if (error.requestId) {
    lines.push(`Request ID: ${error.requestId}`);
  }

  return lines.join("\n");
}

// ============================================================================
// Error Mutation Helpers
// ============================================================================

/**
 * Options for handling mutation errors
 */
export interface MutationErrorHandlerOptions {
  /** Function to show error toast */
  showError?: (message: string, title?: string) => void;
  /** Function to set form errors */
  setFormErrors?: (errors: Record<string, string>) => void;
  /** Custom handler for specific error codes */
  onErrorCode?: Partial<Record<string, (error: ParsedApiError) => void>>;
  /** Handler for auth errors (e.g., redirect to login) */
  onAuthError?: (error: ParsedApiError) => void;
  /** Handler for server errors */
  onServerError?: (error: ParsedApiError) => void;
}

/**
 * Create a standardized mutation error handler
 *
 * @example
 * const handleError = createMutationErrorHandler({
 *   showError: toast.error,
 *   setFormErrors: (errors) => {
 *     Object.entries(errors).forEach(([field, message]) => {
 *       form.setError(field, { message });
 *     });
 *   },
 *   onAuthError: () => router.push('/login'),
 * });
 *
 * mutation.mutate(data, {
 *   onError: handleError,
 * });
 */
export function createMutationErrorHandler(
  options: MutationErrorHandlerOptions
): (error: unknown) => void {
  return (error: unknown) => {
    const parsed = parseApiError(error);

    // Check for custom handler for this error code
    const customHandler = options.onErrorCode?.[parsed.code];
    if (customHandler) {
      customHandler(parsed);
      return;
    }

    // Handle auth errors
    if (requiresReauthentication(parsed) && options.onAuthError) {
      options.onAuthError(parsed);
      return;
    }

    // Handle server errors
    if (isServerError(parsed) && options.onServerError) {
      options.onServerError(parsed);
      // Still show the error
    }

    // Set form validation errors
    if (hasValidationErrors(parsed) && options.setFormErrors) {
      options.setFormErrors(getFieldErrors(parsed.validationErrors));
    }

    // Show error toast
    if (options.showError) {
      options.showError(parsed.message, getErrorTitle(parsed));
    }
  };
}
