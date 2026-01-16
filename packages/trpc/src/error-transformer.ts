import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

// Transform various error types to TRPCError
export const transformError = (error: unknown): TRPCError => {
  // If it's already a TRPCError, return as-is
  if (error instanceof TRPCError) {
    return error;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
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

  // Database constraint errors
  if (error instanceof Error) {
    if (error.message.includes("duplicate key")) {
      return new TRPCError({
        code: "CONFLICT",
        message: "Resource already exists",
      });
    }

    if (error.message.includes("foreign key")) {
      return new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid relational reference",
      });
    }

    // Default: unexpected internal error
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      cause: error,
    });
  }

  // Unknown error object (rare)
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error",
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
      stack: true ? error.stack : undefined,
    },
  };
};
