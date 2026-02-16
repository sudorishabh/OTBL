/**
 * Centralized Error System
 *
 * This module exports all error-related utilities for use throughout the application.
 *
 * ## Quick Start
 *
 * ### In Services (throwing errors):
 * ```typescript
 * import { throwNotFoundError, createValidationError } from './errors';
 *
 * // Simple not found
 * if (!user) throwNotFoundError("User", userId);
 *
 * // Validation error
 * throw createValidationError({
 *   devMessage: "Email format invalid",
 *   fields: [{ field: "email", message: "Invalid email format" }]
 * });
 * ```
 *
 * ### In Routes (automatic transformation):
 * Errors are automatically transformed by the error handling middleware.
 * Just throw AppError or use the factory functions.
 *
 * ### Error Response Structure:
 * Client responses have this structure:
 * ```json
 * {
 *   "error": {
 *     "code": "TRPC_ERROR_CODE",
 *     "data": {
 *       "errorCode": "RESOURCE_NOT_FOUND",
 *       "userMessage": "The user you're looking for doesn't exist",
 *       "validationErrors": [...],
 *       "requestId": "abc-123",
 *       "timestamp": "2024-01-01T00:00:00.000Z"
 *     }
 *   }
 * }
 * ```
 */

// Error codes and types
export {
  ErrorCode,
  AuthErrorCodes,
  ValidationErrorCodes,
  ResourceErrorCodes,
  BusinessErrorCodes,
  ExternalErrorCodes,
  SystemErrorCodes,
  ErrorCodeHttpStatus,
  isAuthError,
  isValidationError,
  isResourceError,
  isBusinessError,
  isExternalError,
  isSystemError,
  isClientError,
  isServerError,
  type ErrorCodeType,
} from "./error-codes";

// User-facing messages
export {
  DefaultUserMessages,
  getUserMessage,
  GENERIC_ERROR_MESSAGE,
  UNKNOWN_ERROR_MESSAGE,
} from "./user-messages";

// AppError class and types
export {
  AppError,
  isAppError,
  isAppErrorLike,
  type ErrorDetails,
  type ErrorMetadata,
  type ValidationFieldError,
} from "./app-error";

// Error factory functions - New simple API
export {
  // Main factory function
  createError,
  // Simple factory functions (new API)
  notFound,
  alreadyExists,
  validationError,
  unauthorized,
  forbidden,
  insufficientPermissions,
  businessRule,
  operationNotAllowed,
  invalidStateTransition,
  internal,
  fromUnknown,
  fromDatabaseError,
  fileError,
  serviceUnavailable,
  timeout,
  rateLimited,
  // Utility
  isDevelopment,
  // Types
  type ErrorOptions,
  // Legacy exports (for backward compatibility)
  createNotFoundError,
  createAlreadyExistsError,
  createResourceError,
  createValidationError,
  createRequiredFieldError,
  createInvalidDateRangeError,
  createDuplicateEntryError,
  createUnauthorizedError,
  createForbiddenError,
  createInsufficientPermissionsError,
  createInvalidCredentialsError,
  createSessionExpiredError,
  createBusinessRuleError,
  createOperationNotAllowedError,
  createInvalidStateTransitionError,
  createServiceUnavailableError,
  createSharePointError,
  createDatabaseError,
  createInternalError,
  createUnexpectedError,
  // Throwing helpers
  throwNotFoundError,
  throwValidationError,
  throwUnauthorizedError,
  throwForbiddenError,
  throwInternalError,
  throwConflictError,
} from "./error-factory";

// tRPC integration
export {
  transformToTRPCError,
  appErrorToTRPCError,
  zodErrorToAppError,
  formatErrorForClient,
  handleDatabaseOperation,
  type TRPCErrorCause,
} from "./trpc-handler";

// Client-side utilities for parsing and handling errors
export {
  parseApiError,
  getFieldErrors,
  getFieldError,
  hasValidationErrors,
  isValidationErrorResponse,
  isAuthErrorResponse,
  requiresReauthentication,
  isNotFoundError,
  isServerError as isServerErrorResponse,
  getErrorTitle,
  formatSupportMessage,
  createMutationErrorHandler,
  type ClientValidationError,
  type ParsedApiError,
  type MutationErrorHandlerOptions,
} from "./client-utils";
