/**
 * Application Error Types
 *
 * This file defines the core error types used throughout the application.
 * AppError is the primary error class that carries both user-facing and
 * developer-facing information.
 */

import { type ErrorCodeType, ErrorCodeHttpStatus } from "./error-codes";
import { getUserMessage } from "./user-messages";

// ============================================================================
// Error Metadata Types
// ============================================================================

/**
 * Validation error details for form fields
 */
export interface ValidationFieldError {
  /** Field name or path (e.g., "email" or "address.city") */
  field: string;
  /** Human-readable error message */
  message: string;
  /** The invalid value (optional, for debugging) */
  value?: unknown;
  /** Validation rule that failed (optional) */
  rule?: string;
}

/**
 * Metadata that can be attached to an error
 */
export interface ErrorMetadata {
  /** Unique request identifier for tracing */
  requestId?: string;
  /** ISO timestamp when the error occurred */
  timestamp?: string;
  /** Duration of the operation in milliseconds */
  durationMs?: number;
  /** The path/endpoint that was called */
  path?: string;
  /** HTTP method used */
  method?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Session ID if available */
  sessionId?: string;
  /** Resource type (e.g., "work_order", "client") */
  resourceType?: string;
  /** Resource ID if applicable */
  resourceId?: string | number;
  /** Additional context-specific data */
  [key: string]: unknown;
}

/**
 * Complete error details structure
 */
export interface ErrorDetails {
  /** Unique error code identifying the error type */
  code: ErrorCodeType;
  /** HTTP status code */
  httpStatus: number;
  /** User-friendly message safe to display to end users */
  userMessage: string;
  /** Developer message with technical details (not for users) */
  devMessage: string;
  /** Validation errors for form fields (if applicable) */
  validationErrors?: ValidationFieldError[];
  /** Additional metadata for debugging and tracing */
  metadata?: ErrorMetadata;
  /** Original error stack (dev only) */
  stack?: string;
  /** Original error that caused this error */
  cause?: unknown;
}

// ============================================================================
// AppError Class
// ============================================================================

/**
 * Application Error Class
 *
 * This is the primary error class used throughout the application.
 * It carries separate messages for users and developers:
 *
 * - userMessage: Safe to display to end users, non-technical
 * - devMessage: Detailed technical message for debugging
 *
 * Usage:
 * ```typescript
 * throw new AppError({
 *   code: ErrorCode.NOT_FOUND,
 *   devMessage: `Work order with ID ${id} not found in database`,
 *   userMessage: "The work order you're looking for doesn't exist",
 * });
 * ```
 */
export class AppError extends Error {
  readonly code: ErrorCodeType;
  readonly httpStatus: number;
  readonly userMessage: string;
  readonly devMessage: string;
  readonly validationErrors?: ValidationFieldError[];
  readonly metadata?: ErrorMetadata;
  readonly originalError?: unknown;
  readonly timestamp: string;

  constructor(options: {
    code: ErrorCodeType;
    devMessage: string;
    userMessage?: string;
    validationErrors?: ValidationFieldError[];
    metadata?: ErrorMetadata;
    cause?: unknown;
  }) {
    const userMessage = options.userMessage || getUserMessage(options.code);

    super(options.devMessage);

    this.name = "AppError";
    this.code = options.code;
    this.httpStatus = ErrorCodeHttpStatus[options.code];
    this.userMessage = userMessage;
    this.devMessage = options.devMessage;
    this.validationErrors = options.validationErrors;
    this.metadata = options.metadata;
    this.originalError = options.cause;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, excluding the constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // If there's an original error with a stack, we might want to preserve it
    if (options.cause instanceof Error && options.cause.stack) {
      this.stack = `${this.stack}\n\nCaused by:\n${options.cause.stack}`;
    }
  }

  /**
   * Convert error to a structured object for logging
   */
  toLogObject(): ErrorDetails {
    return {
      code: this.code,
      httpStatus: this.httpStatus,
      userMessage: this.userMessage,
      devMessage: this.devMessage,
      validationErrors: this.validationErrors,
      metadata: {
        ...this.metadata,
        timestamp: this.timestamp,
      },
      stack: this.stack,
      cause:
        this.originalError instanceof Error
          ? {
              name: this.originalError.name,
              message: this.originalError.message,
              stack: this.originalError.stack,
            }
          : this.originalError,
    };
  }

  /**
   * Convert error to a client-safe response object
   * This NEVER includes stack traces or internal details
   */
  toClientResponse(): {
    code: ErrorCodeType;
    message: string;
    validationErrors?: ValidationFieldError[];
    requestId?: string;
    timestamp: string;
  } {
    return {
      code: this.code,
      message: this.userMessage,
      validationErrors: this.validationErrors,
      requestId: this.metadata?.requestId,
      timestamp: this.timestamp,
    };
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.httpStatus >= 400 && this.httpStatus < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.httpStatus >= 500;
  }

  /**
   * Check if this error should be logged as an error (vs warning)
   */
  shouldLogAsError(): boolean {
    return this.isServerError();
  }

  /**
   * Create an AppError from an unknown error
   */
  static fromUnknown(error: unknown, defaultCode?: ErrorCodeType): AppError {
    // If it's already an AppError, return as-is
    if (error instanceof AppError) {
      return error;
    }

    const code = defaultCode || "SYSTEM_UNEXPECTED_ERROR";

    // If it's a standard Error
    if (error instanceof Error) {
      return new AppError({
        code,
        devMessage: error.message,
        cause: error,
      });
    }

    // If it's a string
    if (typeof error === "string") {
      return new AppError({
        code,
        devMessage: error,
      });
    }

    // Unknown error type
    return new AppError({
      code,
      devMessage: `Unknown error: ${String(error)}`,
      cause: error,
    });
  }
}

// ============================================================================
// Error Type Guards
// ============================================================================

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Check if an error looks like an AppError structure (for serialized errors)
 */
export function isAppErrorLike(
  error: unknown
): error is { code: ErrorCodeType; userMessage: string; devMessage: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "userMessage" in error
  );
}
