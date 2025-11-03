import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Transform various error types to TRPCError
export const transformError = (error: unknown): TRPCError => {
  // If it's already a TRPCError, return as-is
  if (error instanceof TRPCError) {
    return error;
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return new TRPCError({
      code: "BAD_REQUEST",
      message: "Validation failed",
      cause: {
        errors: formattedErrors,
        zodError: error,
      },
    });
  }

  // Handle database constraint errors
  if (error instanceof Error) {
    // Handle unique constraint violations
    if (
      error.message.includes("unique constraint") ||
      error.message.includes("duplicate key")
    ) {
      return new TRPCError({
        code: "CONFLICT",
        message: "Resource already exists",
        cause: { originalError: error },
      });
    }

    // Handle foreign key constraint violations
    if (error.message.includes("foreign key constraint")) {
      return new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid reference to related resource",
        cause: { originalError: error },
      });
    }

    // Handle not null constraint violations
    if (error.message.includes("not null constraint")) {
      return new TRPCError({
        code: "BAD_REQUEST",
        message: "Required field is missing",
        cause: { originalError: error },
      });
    }
  }

  // Generic error fallback
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
    cause: { originalError: error },
  });
};

// Error formatter for client responses
export const errorFormatter = ({
  shape,
  error,
}: {
  shape: any;
  error: TRPCError;
}) => {
  const cause = error.cause as any;

  return {
    ...shape,
    data: {
      ...shape.data,
      // Include additional error details if available
      errorCode: cause?.errorCode,
      validationErrors: cause?.errors,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
  };
};
