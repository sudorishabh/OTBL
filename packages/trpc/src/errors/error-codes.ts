/**
 * Comprehensive Error Codes for the Application
 *
 * Error codes are grouped by category and follow a consistent naming convention:
 * - AUTH_*: Authentication and authorization errors
 * - VALIDATION_*: Input validation and data format errors
 * - RESOURCE_*: Resource state and lifecycle errors
 * - BUSINESS_*: Business logic and domain rule violations
 * - EXTERNAL_*: External service and integration errors
 * - SYSTEM_*: Internal system and infrastructure errors
 */

// ============================================================================
// Error Code Categories
// ============================================================================

/**
 * Authentication & Authorization Error Codes
 */
export const AuthErrorCodes = {
  // Authentication errors
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  TOKEN_MISSING: "AUTH_TOKEN_MISSING",
  REFRESH_TOKEN_EXPIRED: "AUTH_REFRESH_TOKEN_EXPIRED",
  REFRESH_TOKEN_INVALID: "AUTH_REFRESH_TOKEN_INVALID",
  SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
  TOO_MANY_ATTEMPTS: "AUTH_TOO_MANY_ATTEMPTS",
  ACCOUNT_DISABLED: "AUTH_ACCOUNT_DISABLED",
  ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  PASSWORD_MISMATCH: "AUTH_PASSWORD_MISMATCH",
  WEAK_PASSWORD: "AUTH_WEAK_PASSWORD",

  // Authorization errors
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  FORBIDDEN: "AUTH_FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "AUTH_INSUFFICIENT_PERMISSIONS",
  ROLE_NOT_ALLOWED: "AUTH_ROLE_NOT_ALLOWED",
} as const;

/**
 * Validation Error Codes
 */
export const ValidationErrorCodes = {
  // Input validation
  INVALID_INPUT: "VALIDATION_INVALID_INPUT",
  REQUIRED_FIELD_MISSING: "VALIDATION_REQUIRED_FIELD_MISSING",
  INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  INVALID_EMAIL: "VALIDATION_INVALID_EMAIL",
  INVALID_PHONE: "VALIDATION_INVALID_PHONE",
  INVALID_DATE: "VALIDATION_INVALID_DATE",
  INVALID_DATE_RANGE: "VALIDATION_INVALID_DATE_RANGE",
  VALUE_OUT_OF_RANGE: "VALIDATION_VALUE_OUT_OF_RANGE",
  STRING_TOO_LONG: "VALIDATION_STRING_TOO_LONG",
  STRING_TOO_SHORT: "VALIDATION_STRING_TOO_SHORT",
  INVALID_ENUM_VALUE: "VALIDATION_INVALID_ENUM_VALUE",

  // Data integrity
  DUPLICATE_ENTRY: "VALIDATION_DUPLICATE_ENTRY",
  REFERENCE_NOT_FOUND: "VALIDATION_REFERENCE_NOT_FOUND",
  INVALID_REFERENCE: "VALIDATION_INVALID_REFERENCE",
  CIRCULAR_REFERENCE: "VALIDATION_CIRCULAR_REFERENCE",
  DATA_INTEGRITY_ERROR: "VALIDATION_DATA_INTEGRITY_ERROR",

  // File validation
  FILE_TOO_LARGE: "VALIDATION_FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "VALIDATION_INVALID_FILE_TYPE",
  FILE_UPLOAD_FAILED: "VALIDATION_FILE_UPLOAD_FAILED",
} as const;

/**
 * Resource Error Codes
 */
export const ResourceErrorCodes = {
  // Resource lifecycle
  NOT_FOUND: "RESOURCE_NOT_FOUND",
  ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  DELETED: "RESOURCE_DELETED",
  ARCHIVED: "RESOURCE_ARCHIVED",

  // Resource state
  INVALID_STATE: "RESOURCE_INVALID_STATE",
  STATE_TRANSITION_NOT_ALLOWED: "RESOURCE_STATE_TRANSITION_NOT_ALLOWED",
  LOCKED: "RESOURCE_LOCKED",
  IN_USE: "RESOURCE_IN_USE",

  // Resource operations
  CREATE_FAILED: "RESOURCE_CREATE_FAILED",
  UPDATE_FAILED: "RESOURCE_UPDATE_FAILED",
  DELETE_FAILED: "RESOURCE_DELETE_FAILED",
  FETCH_FAILED: "RESOURCE_FETCH_FAILED",
} as const;

/**
 * Business Logic Error Codes
 */
export const BusinessErrorCodes = {
  // General business rules
  RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  PRECONDITION_FAILED: "BUSINESS_PRECONDITION_FAILED",
  OPERATION_NOT_ALLOWED: "BUSINESS_OPERATION_NOT_ALLOWED",
  QUOTA_EXCEEDED: "BUSINESS_QUOTA_EXCEEDED",
  LIMIT_REACHED: "BUSINESS_LIMIT_REACHED",

  // Domain-specific
  WORK_ORDER_CLOSED: "BUSINESS_WORK_ORDER_CLOSED",
  PROPOSAL_ALREADY_APPROVED: "BUSINESS_PROPOSAL_ALREADY_APPROVED",
  SITE_NOT_ACTIVE: "BUSINESS_SITE_NOT_ACTIVE",
  CLIENT_INACTIVE: "BUSINESS_CLIENT_INACTIVE",
  OFFICE_FULL: "BUSINESS_OFFICE_FULL",
  BUDGET_EXCEEDED: "BUSINESS_BUDGET_EXCEEDED",
  DATE_CONFLICT: "BUSINESS_DATE_CONFLICT",
  ASSIGNMENT_CONFLICT: "BUSINESS_ASSIGNMENT_CONFLICT",
} as const;

/**
 * External Service Error Codes
 */
export const ExternalErrorCodes = {
  // General external errors
  SERVICE_UNAVAILABLE: "EXTERNAL_SERVICE_UNAVAILABLE",
  TIMEOUT: "EXTERNAL_TIMEOUT",
  CONNECTION_FAILED: "EXTERNAL_CONNECTION_FAILED",
  RATE_LIMITED: "EXTERNAL_RATE_LIMITED",

  // SharePoint specific
  SHAREPOINT_AUTH_FAILED: "EXTERNAL_SHAREPOINT_AUTH_FAILED",
  SHAREPOINT_UPLOAD_FAILED: "EXTERNAL_SHAREPOINT_UPLOAD_FAILED",
  SHAREPOINT_DOWNLOAD_FAILED: "EXTERNAL_SHAREPOINT_DOWNLOAD_FAILED",
  SHAREPOINT_PERMISSION_DENIED: "EXTERNAL_SHAREPOINT_PERMISSION_DENIED",

  // Database specific
  DATABASE_ERROR: "EXTERNAL_DATABASE_ERROR",
  DATABASE_CONNECTION_FAILED: "EXTERNAL_DATABASE_CONNECTION_FAILED",
  DATABASE_TIMEOUT: "EXTERNAL_DATABASE_TIMEOUT",
} as const;

/**
 * System Error Codes
 */
export const SystemErrorCodes = {
  // Internal errors
  INTERNAL_ERROR: "SYSTEM_INTERNAL_ERROR",
  UNEXPECTED_ERROR: "SYSTEM_UNEXPECTED_ERROR",
  CONFIGURATION_ERROR: "SYSTEM_CONFIGURATION_ERROR",
  MAINTENANCE_MODE: "SYSTEM_MAINTENANCE_MODE",

  // Resource constraints
  MEMORY_EXHAUSTED: "SYSTEM_MEMORY_EXHAUSTED",
  DISK_FULL: "SYSTEM_DISK_FULL",
  OVERLOADED: "SYSTEM_OVERLOADED",
} as const;

// ============================================================================
// Combined Error Codes
// ============================================================================

/**
 * All error codes combined
 */
export const ErrorCode = {
  ...AuthErrorCodes,
  ...ValidationErrorCodes,
  ...ResourceErrorCodes,
  ...BusinessErrorCodes,
  ...ExternalErrorCodes,
  ...SystemErrorCodes,
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// ============================================================================
// Error Code to HTTP Status Mapping
// ============================================================================

/**
 * Maps error codes to appropriate HTTP status codes
 */
export const ErrorCodeHttpStatus: Record<ErrorCodeType, number> = {
  // Auth errors -> 401/403
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.TOKEN_MISSING]: 401,
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 401,
  [ErrorCode.REFRESH_TOKEN_INVALID]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.USER_NOT_FOUND]: 401,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.TOO_MANY_ATTEMPTS]: 429,
  [ErrorCode.ACCOUNT_DISABLED]: 403,
  [ErrorCode.ACCOUNT_LOCKED]: 403,
  [ErrorCode.PASSWORD_MISMATCH]: 400,
  [ErrorCode.WEAK_PASSWORD]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.ROLE_NOT_ALLOWED]: 403,

  // Validation errors -> 400
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.REQUIRED_FIELD_MISSING]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.INVALID_EMAIL]: 400,
  [ErrorCode.INVALID_PHONE]: 400,
  [ErrorCode.INVALID_DATE]: 400,
  [ErrorCode.INVALID_DATE_RANGE]: 400,
  [ErrorCode.VALUE_OUT_OF_RANGE]: 400,
  [ErrorCode.STRING_TOO_LONG]: 400,
  [ErrorCode.STRING_TOO_SHORT]: 400,
  [ErrorCode.INVALID_ENUM_VALUE]: 400,
  [ErrorCode.DUPLICATE_ENTRY]: 409,
  [ErrorCode.REFERENCE_NOT_FOUND]: 400,
  [ErrorCode.INVALID_REFERENCE]: 400,
  [ErrorCode.CIRCULAR_REFERENCE]: 400,
  [ErrorCode.DATA_INTEGRITY_ERROR]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_FILE_TYPE]: 415,
  [ErrorCode.FILE_UPLOAD_FAILED]: 400,

  // Resource errors -> 404/409/422
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.DELETED]: 410,
  [ErrorCode.ARCHIVED]: 410,
  [ErrorCode.INVALID_STATE]: 422,
  [ErrorCode.STATE_TRANSITION_NOT_ALLOWED]: 422,
  [ErrorCode.LOCKED]: 423,
  [ErrorCode.IN_USE]: 409,
  [ErrorCode.CREATE_FAILED]: 500,
  [ErrorCode.UPDATE_FAILED]: 500,
  [ErrorCode.DELETE_FAILED]: 500,
  [ErrorCode.FETCH_FAILED]: 500,

  // Business errors -> 422
  [ErrorCode.RULE_VIOLATION]: 422,
  [ErrorCode.PRECONDITION_FAILED]: 412,
  [ErrorCode.OPERATION_NOT_ALLOWED]: 422,
  [ErrorCode.QUOTA_EXCEEDED]: 429,
  [ErrorCode.LIMIT_REACHED]: 429,
  [ErrorCode.WORK_ORDER_CLOSED]: 422,
  [ErrorCode.PROPOSAL_ALREADY_APPROVED]: 422,
  [ErrorCode.SITE_NOT_ACTIVE]: 422,
  [ErrorCode.CLIENT_INACTIVE]: 422,
  [ErrorCode.OFFICE_FULL]: 422,
  [ErrorCode.BUDGET_EXCEEDED]: 422,
  [ErrorCode.DATE_CONFLICT]: 422,
  [ErrorCode.ASSIGNMENT_CONFLICT]: 422,

  // External errors -> 502/503/504
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.TIMEOUT]: 504,
  [ErrorCode.CONNECTION_FAILED]: 502,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.SHAREPOINT_AUTH_FAILED]: 502,
  [ErrorCode.SHAREPOINT_UPLOAD_FAILED]: 502,
  [ErrorCode.SHAREPOINT_DOWNLOAD_FAILED]: 502,
  [ErrorCode.SHAREPOINT_PERMISSION_DENIED]: 502,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.DATABASE_CONNECTION_FAILED]: 503,
  [ErrorCode.DATABASE_TIMEOUT]: 504,

  // System errors -> 500
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.UNEXPECTED_ERROR]: 500,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
  [ErrorCode.MAINTENANCE_MODE]: 503,
  [ErrorCode.MEMORY_EXHAUSTED]: 503,
  [ErrorCode.DISK_FULL]: 503,
  [ErrorCode.OVERLOADED]: 503,
};

// ============================================================================
// Error Code Category Helpers
// ============================================================================

/**
 * Check if an error code is an authentication error
 */
export function isAuthError(code: ErrorCodeType): boolean {
  return code.startsWith("AUTH_");
}

/**
 * Check if an error code is a validation error
 */
export function isValidationError(code: ErrorCodeType): boolean {
  return code.startsWith("VALIDATION_");
}

/**
 * Check if an error code is a resource error
 */
export function isResourceError(code: ErrorCodeType): boolean {
  return code.startsWith("RESOURCE_");
}

/**
 * Check if an error code is a business logic error
 */
export function isBusinessError(code: ErrorCodeType): boolean {
  return code.startsWith("BUSINESS_");
}

/**
 * Check if an error code is an external service error
 */
export function isExternalError(code: ErrorCodeType): boolean {
  return code.startsWith("EXTERNAL_");
}

/**
 * Check if an error code is a system error
 */
export function isSystemError(code: ErrorCodeType): boolean {
  return code.startsWith("SYSTEM_");
}

/**
 * Check if an error is a client error (4xx)
 */
export function isClientError(code: ErrorCodeType): boolean {
  const status = ErrorCodeHttpStatus[code];
  return status >= 400 && status < 500;
}

/**
 * Check if an error is a server error (5xx)
 */
export function isServerError(code: ErrorCodeType): boolean {
  const status = ErrorCodeHttpStatus[code];
  return status >= 500;
}
