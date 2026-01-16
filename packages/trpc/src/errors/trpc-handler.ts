/**
 * tRPC Error Handler
 *
 * This module provides the integration between AppError and tRPC's error system.
 * It handles:
 * - Converting AppError instances to TRPCError
 * - Transforming unknown errors to proper TRPCError
 * - Formatting errors for client responses
 * - Handling Zod validation errors
 */

import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import {
  AppError,
  type ValidationFieldError,
  type ErrorMetadata,
} from "./app-error";
import { ErrorCode, type ErrorCodeType } from "./error-codes";
import { GENERIC_ERROR_MESSAGE } from "./user-messages";

// ============================================================================
// tRPC Error Code Mapping
// ============================================================================

/**
 * Maps HTTP status codes to tRPC error codes
 */
type TRPCErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "METHOD_NOT_SUPPORTED"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNPROCESSABLE_CONTENT"
  | "TOO_MANY_REQUESTS"
  | "CLIENT_CLOSED_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_IMPLEMENTED"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"
  | "GATEWAY_TIMEOUT";

/**
 * Map HTTP status codes to tRPC error codes
 */
function httpStatusToTRPCCode(status: number): TRPCErrorCode {
  const mapping: Record<number, TRPCErrorCode> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    408: "TIMEOUT",
    409: "CONFLICT",
    410: "NOT_FOUND", // Gone -> Not Found
    412: "PRECONDITION_FAILED",
    413: "PAYLOAD_TOO_LARGE",
    415: "UNSUPPORTED_MEDIA_TYPE",
    422: "UNPROCESSABLE_CONTENT",
    423: "FORBIDDEN", // Locked -> Forbidden
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
  };

  return mapping[status] || "INTERNAL_SERVER_ERROR";
}

// ============================================================================
// Error Cause Structure
// ============================================================================

/**
 * Structure for error cause that gets passed to tRPC
 * This is what we can access via error.cause in error handlers
 */
export interface TRPCErrorCause {
  /** Our application error code */
  errorCode: ErrorCodeType;
  /** User-friendly message */
  userMessage: string;
  /** Developer message (for debugging) */
  devMessage: string;
  /** HTTP status code */
  httpStatus: number;
  /** Field-level validation errors */
  validationErrors?: ValidationFieldError[];
  /** Request metadata */
  metadata?: ErrorMetadata;
  /** ISO timestamp */
  timestamp: string;
}

// ============================================================================
// Error Transformation
// ============================================================================

/**
 * Transform an AppError to a TRPCError
 */
export function appErrorToTRPCError(error: AppError): TRPCError {
  const cause: TRPCErrorCause = {
    errorCode: error.code,
    userMessage: error.userMessage,
    devMessage: error.devMessage,
    httpStatus: error.httpStatus,
    validationErrors: error.validationErrors,
    metadata: error.metadata,
    timestamp: error.timestamp,
  };

  return new TRPCError({
    code: httpStatusToTRPCCode(error.httpStatus),
    message: error.userMessage, // tRPC message is user-facing
    cause,
  });
}

/**
 * Transform a Zod validation error to an AppError
 */
export function zodErrorToAppError(error: ZodError): AppError {
  const validationErrors: ValidationFieldError[] = error.issues.map(
    (issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      rule: issue.code,
    })
  );

  return new AppError({
    code: ErrorCode.INVALID_INPUT,
    devMessage: `Validation failed: ${error.issues.length} error(s)`,
    userMessage: "Please check the form for errors and try again.",
    validationErrors,
    cause: error,
  });
}

/**
 * Transform any error to a TRPCError
 *
 * This is the main transformer that handles all error types:
 * - AppError: Converts using appErrorToTRPCError
 * - TRPCError: Returns as-is (already a TRPCError)
 * - ZodError: Converts to validation AppError first
 * - Unknown: Wraps in a generic internal error
 */
export function transformToTRPCError(error: unknown): TRPCError {
  // Already a TRPCError, but might need cause enrichment
  if (error instanceof TRPCError) {
    // Check if cause is already our TRPCErrorCause structure
    if (
      error.cause &&
      typeof error.cause === "object" &&
      "errorCode" in error.cause
    ) {
      return error;
    }

    // Enrich with our cause structure
    const cause: TRPCErrorCause = {
      errorCode: trcpCodeToAppErrorCode(error.code),
      userMessage: error.message,
      devMessage: error.message,
      httpStatus: trcpCodeToHttpStatus(error.code),
      timestamp: new Date().toISOString(),
    };

    return new TRPCError({
      code: error.code,
      message: error.message,
      cause,
    });
  }

  // AppError - our custom error type
  if (error instanceof AppError) {
    return appErrorToTRPCError(error);
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return appErrorToTRPCError(zodErrorToAppError(error));
  }

  // Database errors (common patterns)
  if (error instanceof Error) {
    // Duplicate key / unique constraint
    if (
      error.message.includes("duplicate key") ||
      error.message.includes("unique constraint") ||
      error.message.includes("Duplicate entry")
    ) {
      const appError = new AppError({
        code: ErrorCode.DUPLICATE_ENTRY,
        devMessage: error.message,
        cause: error,
      });
      return appErrorToTRPCError(appError);
    }

    // Foreign key constraint
    if (error.message.includes("foreign key")) {
      const appError = new AppError({
        code: ErrorCode.INVALID_REFERENCE,
        devMessage: error.message,
        cause: error,
      });
      return appErrorToTRPCError(appError);
    }

    // Not null constraint
    if (
      error.message.includes("not null") ||
      error.message.includes("NOT NULL")
    ) {
      const appError = new AppError({
        code: ErrorCode.REQUIRED_FIELD_MISSING,
        devMessage: error.message,
        cause: error,
      });
      return appErrorToTRPCError(appError);
    }

    // Generic Error
    const appError = new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      devMessage: error.message,
      userMessage: GENERIC_ERROR_MESSAGE,
      cause: error,
    });
    return appErrorToTRPCError(appError);
  }

  // Completely unknown error
  const appError = new AppError({
    code: ErrorCode.UNEXPECTED_ERROR,
    devMessage: String(error),
    userMessage: GENERIC_ERROR_MESSAGE,
    cause: error,
  });
  return appErrorToTRPCError(appError);
}

/**
 * Map tRPC error code to our app error code
 */
function trcpCodeToAppErrorCode(code: string): ErrorCodeType {
  const mapping: Record<string, ErrorCodeType> = {
    BAD_REQUEST: ErrorCode.INVALID_INPUT,
    UNAUTHORIZED: ErrorCode.UNAUTHORIZED,
    FORBIDDEN: ErrorCode.FORBIDDEN,
    NOT_FOUND: ErrorCode.NOT_FOUND,
    TIMEOUT: ErrorCode.TIMEOUT,
    CONFLICT: ErrorCode.ALREADY_EXISTS,
    PRECONDITION_FAILED: ErrorCode.PRECONDITION_FAILED,
    PAYLOAD_TOO_LARGE: ErrorCode.FILE_TOO_LARGE,
    TOO_MANY_REQUESTS: ErrorCode.TOO_MANY_ATTEMPTS,
    INTERNAL_SERVER_ERROR: ErrorCode.INTERNAL_ERROR,
    SERVICE_UNAVAILABLE: ErrorCode.SERVICE_UNAVAILABLE,
    GATEWAY_TIMEOUT: ErrorCode.TIMEOUT,
    PARSE_ERROR: ErrorCode.INVALID_INPUT,
  };

  return mapping[code] || ErrorCode.INTERNAL_ERROR;
}

/**
 * Map tRPC error code to HTTP status
 */
function trcpCodeToHttpStatus(code: string): number {
  const mapping: Record<string, number> = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  };

  return mapping[code] || 500;
}

// ============================================================================
// Error Formatter for tRPC
// ============================================================================

/**
 * Error formatter for tRPC responses
 *
 * This is used in tRPC initialization to shape error responses.
 * It ensures client responses have our standardized structure.
 */
export function formatErrorForClient({
  shape,
  error,
}: {
  shape: any;
  error: TRPCError;
}): any {
  const cause = error.cause as TRPCErrorCause | undefined;

  // Determine if we're in development mode
  const isDev = process.env.NODE_ENV !== "production";

  return {
    ...shape,
    data: {
      ...shape.data,
      // Standard fields
      code: shape.data.code,
      httpStatus: shape.data.httpStatus,

      // Our custom fields
      errorCode: cause?.errorCode || "SYSTEM_INTERNAL_ERROR",
      userMessage: cause?.userMessage || error.message,
      validationErrors: cause?.validationErrors,
      requestId: cause?.metadata?.requestId,
      timestamp: cause?.timestamp || new Date().toISOString(),

      // Development-only fields
      ...(isDev && {
        devMessage: cause?.devMessage,
        stack: error.stack,
        metadata: cause?.metadata,
      }),
    },
  };
}

// ============================================================================
// Database Operation Helper
// ============================================================================

/**
 * Wrap a database operation with error handling
 *
 * Usage:
 * ```typescript
 * const users = await handleDatabaseOperation(
 *   () => db.select().from(usersTable),
 *   "Failed to fetch users"
 * );
 * ```
 */
export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string = "Database operation failed",
  metadata?: ErrorMetadata
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);

    // Let the transformer handle the specific error type
    const trpcError = transformToTRPCError(error);

    // If it's already been transformed, just throw it
    if (error instanceof TRPCError || error instanceof AppError) {
      throw trpcError;
    }

    // For other errors, wrap with our context
    const appError = new AppError({
      code: ErrorCode.DATABASE_ERROR,
      devMessage:
        errorMessage + (error instanceof Error ? `: ${error.message}` : ""),
      userMessage: "We're having trouble accessing the data. Please try again.",
      metadata,
      cause: error,
    });

    throw appErrorToTRPCError(appError);
  }
}
