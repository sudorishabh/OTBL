/**
 * Error Factory Functions
 *
 * Convenient factory functions for creating common errors.
 * These functions provide a clean, consistent API for throwing errors
 * throughout the application.
 *
 * Usage:
 * ```typescript
 * // Simple usage with resource name
 * throw createNotFoundError("Work order");
 *
 * // With custom messages
 * throw createValidationError({
 *   devMessage: "Invalid date format for start_date field",
 *   userMessage: "Please enter a valid start date",
 * });
 *
 * // With validation field errors
 * throw createValidationError({
 *   devMessage: "Form validation failed",
 *   fields: [
 *     { field: "email", message: "Invalid email format" },
 *     { field: "phone", message: "Phone number is required" },
 *   ],
 * });
 * ```
 */

import { ErrorCode, type ErrorCodeType } from "./error-codes";
import {
  AppError,
  type ErrorMetadata,
  type ValidationFieldError,
} from "./app-error";

// ============================================================================
// Common Error Creator Options
// ============================================================================

interface BaseErrorOptions {
  devMessage?: string;
  userMessage?: string;
  metadata?: ErrorMetadata;
  cause?: unknown;
}

interface ValidationErrorOptions extends BaseErrorOptions {
  fields?: ValidationFieldError[];
}

// ============================================================================
// Resource Errors
// ============================================================================

/**
 * Create a "not found" error for any resource
 */
export function createNotFoundError(
  resourceType: string,
  resourceId?: string | number,
  options?: BaseErrorOptions
): AppError {
  const resourceDisplay = resourceId
    ? `${resourceType} (ID: ${resourceId})`
    : resourceType;

  return new AppError({
    code: ErrorCode.NOT_FOUND,
    devMessage:
      options?.devMessage || `${resourceDisplay} not found in database`,
    userMessage:
      options?.userMessage ||
      `The ${resourceType.toLowerCase()} you're looking for doesn't exist or has been removed.`,
    metadata: {
      ...options?.metadata,
      resourceType,
      resourceId,
    },
    cause: options?.cause,
  });
}

/**
 * Create an "already exists" error for duplicate resources
 */
export function createAlreadyExistsError(
  resourceType: string,
  identifier?: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.ALREADY_EXISTS,
    devMessage:
      options?.devMessage ||
      `${resourceType}${identifier ? ` with identifier "${identifier}"` : ""} already exists`,
    userMessage:
      options?.userMessage ||
      `A ${resourceType.toLowerCase()} with this information already exists.`,
    metadata: {
      ...options?.metadata,
      resourceType,
    },
    cause: options?.cause,
  });
}

/**
 * Create a generic resource error
 */
export function createResourceError(
  code: ErrorCodeType,
  resourceType: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code,
    devMessage:
      options?.devMessage || `Resource error for ${resourceType}: ${code}`,
    userMessage: options?.userMessage,
    metadata: {
      ...options?.metadata,
      resourceType,
    },
    cause: options?.cause,
  });
}

// ============================================================================
// Validation Errors
// ============================================================================

/**
 * Create a validation error
 */
export function createValidationError(
  options: ValidationErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.INVALID_INPUT,
    devMessage: options.devMessage || "Validation failed",
    userMessage:
      options.userMessage ||
      "The information you provided is invalid. Please check your entries.",
    validationErrors: options.fields,
    metadata: options.metadata,
    cause: options.cause,
  });
}

/**
 * Create a validation error for required fields
 */
export function createRequiredFieldError(
  fieldName: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.REQUIRED_FIELD_MISSING,
    devMessage:
      options?.devMessage || `Required field "${fieldName}" is missing`,
    userMessage: options?.userMessage || `${fieldName} is required.`,
    validationErrors: [{ field: fieldName, message: "This field is required" }],
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create a validation error for invalid date ranges
 */
export function createInvalidDateRangeError(
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.INVALID_DATE_RANGE,
    devMessage: options?.devMessage || "End date must be after start date",
    userMessage:
      options?.userMessage ||
      "The end date must be after the start date. Please correct the dates.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create a duplicate entry error
 */
export function createDuplicateEntryError(
  fieldName: string,
  value?: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.DUPLICATE_ENTRY,
    devMessage:
      options?.devMessage ||
      `Duplicate entry for "${fieldName}"${value ? `: "${value}"` : ""}`,
    userMessage:
      options?.userMessage ||
      `This ${fieldName.toLowerCase()} is already in use. Please choose a different one.`,
    validationErrors: [
      { field: fieldName, message: "This value is already in use", value },
    ],
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

// ============================================================================
// Authentication & Authorization Errors
// ============================================================================

/**
 * Create an unauthorized error (not logged in)
 */
export function createUnauthorizedError(options?: BaseErrorOptions): AppError {
  return new AppError({
    code: ErrorCode.UNAUTHORIZED,
    devMessage: options?.devMessage || "User is not authenticated",
    userMessage: options?.userMessage || "Please log in to continue.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create a forbidden error (logged in but no permission)
 */
export function createForbiddenError(
  action?: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.FORBIDDEN,
    devMessage:
      options?.devMessage ||
      `User does not have permission${action ? ` to ${action}` : ""}`,
    userMessage:
      options?.userMessage ||
      "You don't have permission to perform this action.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create an insufficient permissions error
 */
export function createInsufficientPermissionsError(
  requiredRole?: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
    devMessage:
      options?.devMessage ||
      `Insufficient permissions${requiredRole ? `. Required role: ${requiredRole}` : ""}`,
    userMessage:
      options?.userMessage ||
      "Your current role doesn't have permission for this action. Contact your administrator if you need access.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create an invalid credentials error
 */
export function createInvalidCredentialsError(
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.INVALID_CREDENTIALS,
    devMessage: options?.devMessage || "Invalid email or password",
    userMessage:
      options?.userMessage || "The email or password you entered is incorrect.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create a session expired error
 */
export function createSessionExpiredError(
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.SESSION_EXPIRED,
    devMessage: options?.devMessage || "User session has expired",
    userMessage:
      options?.userMessage || "Your session has expired. Please log in again.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

// ============================================================================
// Business Logic Errors
// ============================================================================

/**
 * Create a business rule violation error
 */
export function createBusinessRuleError(
  rule: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.RULE_VIOLATION,
    devMessage: options?.devMessage || `Business rule violation: ${rule}`,
    userMessage:
      options?.userMessage ||
      "This action cannot be completed due to business rules.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create an operation not allowed error
 */
export function createOperationNotAllowedError(
  operation: string,
  reason?: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.OPERATION_NOT_ALLOWED,
    devMessage:
      options?.devMessage ||
      `Operation "${operation}" is not allowed${reason ? `: ${reason}` : ""}`,
    userMessage:
      options?.userMessage ||
      "This operation cannot be performed at this time.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create a state transition error
 */
export function createInvalidStateTransitionError(
  currentState: string,
  targetState: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.STATE_TRANSITION_NOT_ALLOWED,
    devMessage:
      options?.devMessage ||
      `Invalid state transition from "${currentState}" to "${targetState}"`,
    userMessage:
      options?.userMessage ||
      `This status change is not allowed. Current status: ${currentState}.`,
    metadata: {
      ...options?.metadata,
      currentState,
      targetState,
    },
    cause: options?.cause,
  });
}

// ============================================================================
// External Service Errors
// ============================================================================

/**
 * Create a service unavailable error
 */
export function createServiceUnavailableError(
  serviceName: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.SERVICE_UNAVAILABLE,
    devMessage:
      options?.devMessage || `External service "${serviceName}" is unavailable`,
    userMessage:
      options?.userMessage ||
      "The service is temporarily unavailable. Please try again later.",
    metadata: {
      ...options?.metadata,
      serviceName,
    },
    cause: options?.cause,
  });
}

/**
 * Create a SharePoint error
 */
export function createSharePointError(
  operation: "upload" | "download" | "auth" | "permission",
  options?: BaseErrorOptions
): AppError {
  const codeMap = {
    upload: ErrorCode.SHAREPOINT_UPLOAD_FAILED,
    download: ErrorCode.SHAREPOINT_DOWNLOAD_FAILED,
    auth: ErrorCode.SHAREPOINT_AUTH_FAILED,
    permission: ErrorCode.SHAREPOINT_PERMISSION_DENIED,
  };

  return new AppError({
    code: codeMap[operation],
    devMessage:
      options?.devMessage || `SharePoint ${operation} operation failed`,
    userMessage: options?.userMessage,
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create a database error
 */
export function createDatabaseError(
  operation?: string,
  options?: BaseErrorOptions
): AppError {
  return new AppError({
    code: ErrorCode.DATABASE_ERROR,
    devMessage:
      options?.devMessage ||
      `Database operation failed${operation ? `: ${operation}` : ""}`,
    userMessage:
      options?.userMessage ||
      "We're experiencing technical difficulties. Please try again later.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

// ============================================================================
// System Errors
// ============================================================================

/**
 * Create an internal server error
 */
export function createInternalError(options?: BaseErrorOptions): AppError {
  return new AppError({
    code: ErrorCode.INTERNAL_ERROR,
    devMessage: options?.devMessage || "Internal server error",
    userMessage:
      options?.userMessage ||
      "Something went wrong on our end. Please try again later.",
    metadata: options?.metadata,
    cause: options?.cause,
  });
}

/**
 * Create an unexpected error from an unknown error
 */
export function createUnexpectedError(
  error: unknown,
  context?: string
): AppError {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  return new AppError({
    code: ErrorCode.UNEXPECTED_ERROR,
    devMessage: context ? `${context}: ${message}` : message,
    userMessage: "An unexpected error occurred. Please try again later.",
    cause: error,
  });
}

// ============================================================================
// Throwing Helpers (for convenience in services)
// ============================================================================

/**
 * Throw a not found error
 *
 * @example
 * if (!workOrder) {
 *   throwNotFoundError("Work order", id);
 * }
 */
export function throwNotFoundError(
  resourceType: string,
  resourceId?: string | number,
  options?: BaseErrorOptions
): never {
  throw createNotFoundError(resourceType, resourceId, options);
}

/**
 * Throw a validation error
 */
export function throwValidationError(
  message: string,
  fields?: ValidationFieldError[]
): never {
  throw createValidationError({
    devMessage: message,
    fields,
  });
}

/**
 * Throw an unauthorized error
 */
export function throwUnauthorizedError(message?: string): never {
  throw createUnauthorizedError({ devMessage: message });
}

/**
 * Throw a forbidden error
 */
export function throwForbiddenError(action?: string): never {
  throw createForbiddenError(action);
}

/**
 * Throw an internal error
 */
export function throwInternalError(message?: string): never {
  throw createInternalError({ devMessage: message });
}

/**
 * Throw a conflict error (already exists)
 */
export function throwConflictError(
  resourceType: string,
  identifier?: string
): never {
  throw createAlreadyExistsError(resourceType, identifier);
}
