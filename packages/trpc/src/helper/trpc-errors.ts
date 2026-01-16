/**
 * tRPC Error Helpers (Backward Compatibility Layer)
 *
 * @deprecated This file is kept for backward compatibility.
 * Please import from '../errors' instead.
 *
 * Migration:
 * - import { throwNotFoundError } from '../errors'
 * - import { handleDatabaseOperation } from '../errors'
 */

// Re-export everything from the new errors module
export {
  // Throwing helpers (these match the old API)
  throwNotFoundError as throwNotFound,
  throwUnauthorizedError as throwUnauthorized,
  throwForbiddenError as throwForbidden,
  throwValidationError,
  throwConflictError as throwConflict,
  throwInternalError,

  // Database operation wrapper
  handleDatabaseOperation,
} from "../errors";

// Also export the new error factory functions
export {
  createNotFoundError,
  createValidationError,
  createUnauthorizedError,
  createForbiddenError,
  createInternalError,
  createAlreadyExistsError,
  AppError,
  ErrorCode,
} from "../errors";
