# tRPC Error Handling Best Practices

This document outlines the best practices for error handling in your tRPC application.

## Overview

The error handling system consists of several layers:

1. **Global Error Transformer** - Converts various error types to TRPCError
2. **Error Formatter** - Formats errors for client responses
3. **Logging Middleware** - Tracks procedure calls and errors
4. **Utility Functions** - Provides convenient error throwing functions
5. **Database Operation Helper** - Handles database-specific errors

## Usage Examples

### 1. Using Error Utility Functions

```typescript
import {
  throwNotFound,
  throwValidationError,
  handleDatabaseOperation,
} from "../../utils/trpc-errors";

export const getUserRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await handleDatabaseOperation(
        () => db.select().from(UserTable).where(eq(UserTable.id, input.id)),
        "Failed to fetch user"
      );

      if (user.length === 0) {
        throwNotFound("User");
      }

      return user[0];
    }),

  updateUser: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate authorization
      if (ctx.user.id !== input.id && ctx.user.role !== "admin") {
        throwForbidden("Cannot update other users");
      }

      const result = await handleDatabaseOperation(
        () => db.update(UserTable).set(input).where(eq(UserTable.id, input.id)),
        "Failed to update user"
      );

      return { success: true };
    }),
});
```

### 2. Manual Error Handling

```typescript
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../enums/error-codes";

export const customRouter = router({
  complexOperation: publicProcedure
    .input(complexSchema)
    .mutation(async ({ input }) => {
      try {
        // Complex business logic
        const result = await someComplexOperation(input);

        if (!result.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Operation failed validation",
            cause: {
              errorCode: ErrorCode.VALIDATION_ERROR,
              details: result.errors,
            },
          });
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error; // Re-throw tRPC errors as-is
        }

        // Handle unexpected errors
        console.error("Unexpected error in complexOperation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: {
            errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
            originalError: error,
          },
        });
      }
    }),
});
```

### 3. Client-Side Error Handling

```typescript
// In your React component or client code
import { api } from "../lib/trpc";

const useUserMutation = () => {
  return api.user.updateUser.useMutation({
    onError: (error) => {
      // tRPC errors have structured data
      console.error("Error code:", error.data?.errorCode);
      console.error("Validation errors:", error.data?.validationErrors);

      // Handle specific error codes
      switch (error.data?.errorCode) {
        case "AUTH_UNAUTHORIZED_ACCESS":
          // Redirect to login
          break;
        case "VALIDATION_ERROR":
          // Show validation errors
          break;
        default:
          // Show generic error message
          break;
      }
    },
  });
};
```

## Error Types and Codes

### HTTP Status to tRPC Code Mapping

- `400` → `BAD_REQUEST`
- `401` → `UNAUTHORIZED`
- `403` → `FORBIDDEN`
- `404` → `NOT_FOUND`
- `409` → `CONFLICT`
- `422` → `UNPROCESSABLE_CONTENT`
- `429` → `TOO_MANY_REQUESTS`
- `500` → `INTERNAL_SERVER_ERROR`

### Custom Error Codes

All custom error codes are defined in `src/enums/error-codes.ts`:

- `AUTH_*` - Authentication and authorization errors
- `ACCESS_*` - Access control errors
- `VALIDATION_ERROR` - Data validation errors
- `RESOURCE_NOT_FOUND` - Resource not found errors
- `INTERNAL_SERVER_ERROR` - System errors

## Database Error Handling

The `handleDatabaseOperation` function automatically handles common database errors:

- **Unique constraint violations** → `CONFLICT` with appropriate message
- **Foreign key constraint violations** → `BAD_REQUEST` with validation message
- **Not null constraint violations** → `BAD_REQUEST` with required field message

## Logging

All procedure calls are automatically logged with:

- Start/end timestamps
- Duration
- Input data (in development)
- Error details (with stack traces in development)
- Success/failure status

## Best Practices

1. **Use utility functions** for common error scenarios
2. **Always use `handleDatabaseOperation`** for database calls
3. **Include meaningful error messages** for users
4. **Use appropriate error codes** for client-side handling
5. **Log errors with context** for debugging
6. **Don't expose sensitive information** in error messages
7. **Use the global error transformer** instead of manual try-catch when possible

## Environment-Specific Behavior

- **Development**: Full error details, stack traces, and input logging
- **Production**: Sanitized error messages and minimal sensitive data exposure
