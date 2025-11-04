import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../enums/error-codes";

// Utility functions to throw common errors with proper codes
export function throwNotFound(resource: string = "Resource"): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `${resource} not found`,
    cause: { errorCode: ErrorCode.RESOURCE_NOT_FOUND },
  });
}

export function throwUnauthorized(message = "Unauthorized access"): never {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message,
    cause: { errorCode: ErrorCode.AUTH_UNAUTHORIZED_ACCESS },
  });
}

export function throwForbidden(message = "Access forbidden"): never {
  throw new TRPCError({
    code: "FORBIDDEN",
    message,
    cause: { errorCode: ErrorCode.ACCESS_FORBIDDEN },
  });
}

export function throwValidationError(message = "Validation failed"): never {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message,
    cause: { errorCode: ErrorCode.VALIDATION_ERROR },
  });
}

export function throwConflict(message = "Resource already exists"): never {
  throw new TRPCError({
    code: "CONFLICT",
    message,
    cause: { errorCode: ErrorCode.VALIDATION_ERROR },
  });
}

export function throwInternalError(message = "Internal server error"): never {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message,
    cause: { errorCode: ErrorCode.INTERNAL_SERVER_ERROR },
  });
}

// Helper to handle database operations with error handling
export const handleDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = "Database operation failed"
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);

    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes("unique constraint")) {
        throwConflict("Resource already exists with this identifier");
      }
      if (error.message.includes("foreign key")) {
        throwValidationError("Invalid reference to related resource");
      }
      if (error.message.includes("not null")) {
        throwValidationError("Required field cannot be empty");
      }
    }

    // This will always throw, satisfying TypeScript's return requirements
    return throwInternalError(errorMessage);
  }
};
