# Centralized Error Handling System

## Overview

This document describes the centralized error handling system for the OTBL application. The system provides:

1. **Consistent error structure** across all APIs
2. **Dual messaging** - user-friendly messages for clients, detailed messages for developers
3. **Type-safe error codes** with categorization
4. **Automatic error transformation** in tRPC middleware
5. **Frontend utilities** for parsing and displaying errors

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Error Flow                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Service Layer                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  throw createNotFoundError("User", userId);                 │   │
│   │  throw createValidationError({ fields: [...] });            │   │
│   │  throwValidationError("Invalid input");                     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   Error Handling Middleware                                         │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  transformToTRPCError(error)                                │   │
│   │  - AppError → TRPCError with cause                          │   │
│   │  - ZodError → Validation AppError → TRPCError               │   │
│   │  - DB errors → Appropriate AppError → TRPCError             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   Error Formatter                                                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  formatErrorForClient(shape, error)                         │   │
│   │  - Adds: errorCode, userMessage, validationErrors           │   │
│   │  - Dev mode: devMessage, stack, metadata                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   Client Response                                                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  {                                                          │   │
│   │    "error": {                                               │   │
│   │      "message": "User not found",                           │   │
│   │      "code": "NOT_FOUND",                                   │   │
│   │      "data": {                                              │   │
│   │        "errorCode": "RESOURCE_NOT_FOUND",                   │   │
│   │        "userMessage": "The user doesn't exist",             │   │
│   │        "validationErrors": [...],                           │   │
│   │        "timestamp": "2024-01-01T00:00:00.000Z"              │   │
│   │      }                                                      │   │
│   │    }                                                        │   │
│   │  }                                                          │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Error Code Categories

| Category   | Prefix        | HTTP Status Range  | Description                    |
| ---------- | ------------- | ------------------ | ------------------------------ |
| Auth       | `AUTH_`       | 401, 403           | Authentication & Authorization |
| Validation | `VALIDATION_` | 400, 409, 413, 415 | Input validation errors        |
| Resource   | `RESOURCE_`   | 404, 409, 410, 422 | Resource lifecycle errors      |
| Business   | `BUSINESS_`   | 412, 422, 429      | Business logic violations      |
| External   | `EXTERNAL_`   | 429, 502, 503, 504 | External service errors        |
| System     | `SYSTEM_`     | 500, 503           | Internal system errors         |

## Usage Guide

### In Services - Throwing Errors

```typescript
import {
  throwNotFoundError,
  throwValidationError,
  createValidationError,
  createBusinessRuleError,
  handleDatabaseOperation,
} from "@pkg/trpc";

// Simple not found error
if (!user) {
  throwNotFoundError("User", userId);
}

// Validation error with simple message
if (!isValidEmail(email)) {
  throwValidationError("Invalid email format");
}

// Validation error with field details
throw createValidationError({
  devMessage: "Form validation failed",
  fields: [
    { field: "email", message: "Invalid email format" },
    { field: "password", message: "Password must be at least 8 characters" },
  ],
});

// Business rule error
if (workOrder.status === "closed") {
  throw createBusinessRuleError("Cannot modify closed work order", {
    userMessage: "This work order is closed and cannot be modified.",
  });
}

// Wrap database operations
const users = await handleDatabaseOperation(
  () => db.select().from(usersTable).where(eq(usersTable.id, id)),
  "Failed to fetch user"
);
```

### In Routes - Automatic Handling

Routes don't need special error handling - the middleware handles everything:

```typescript
export const userQueryRouter = router({
  getUser: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const service = new UserService(ctx);
      return service.getUser(input.id);
      // Errors from service are automatically transformed
    }),
});
```

### On Frontend - Parsing Errors

```typescript
import {
  parseApiError,
  getFieldErrors,
  hasValidationErrors,
  createMutationErrorHandler,
} from "@pkg/trpc";

// Basic usage
try {
  await mutation.mutateAsync(data);
} catch (error) {
  const parsed = parseApiError(error);

  // Show user message
  toast.error(parsed.message);

  // Handle validation errors
  if (hasValidationErrors(parsed)) {
    const fieldErrors = getFieldErrors(parsed.validationErrors);
    Object.entries(fieldErrors).forEach(([field, message]) => {
      form.setError(field, { message });
    });
  }
}

// Using the mutation error handler factory
const handleError = createMutationErrorHandler({
  showError: (message, title) => toast.error(message, { title }),
  setFormErrors: (errors) => {
    Object.entries(errors).forEach(([field, message]) => {
      form.setError(field, { message });
    });
  },
  onAuthError: () => router.push("/login"),
});

// Use in mutation
mutation.mutate(data, { onError: handleError });
```

## Error Response Structure

### Production Mode

```json
{
  "error": {
    "message": "The user you're looking for doesn't exist.",
    "code": "NOT_FOUND",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404,
      "errorCode": "RESOURCE_NOT_FOUND",
      "userMessage": "The user you're looking for doesn't exist.",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "requestId": "abc-123"
    }
  }
}
```

### Development Mode (additional fields)

```json
{
  "error": {
    "message": "The user you're looking for doesn't exist.",
    "code": "NOT_FOUND",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404,
      "errorCode": "RESOURCE_NOT_FOUND",
      "userMessage": "The user you're looking for doesn't exist.",
      "devMessage": "User (ID: 123) not found in database",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "stack": "Error: User not found\n    at UserService.getUser...",
      "metadata": {
        "resourceType": "User",
        "resourceId": 123
      }
    }
  }
}
```

### Validation Error Response

```json
{
  "error": {
    "message": "Please check the form for errors and try again.",
    "code": "BAD_REQUEST",
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "errorCode": "VALIDATION_INVALID_INPUT",
      "userMessage": "Please check the form for errors and try again.",
      "validationErrors": [
        { "field": "email", "message": "Invalid email format" },
        { "field": "phone", "message": "Phone number is required" }
      ],
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Available Error Factory Functions

### Resource Errors

- `createNotFoundError(resourceType, resourceId?, options?)`
- `createAlreadyExistsError(resourceType, identifier?, options?)`
- `createResourceError(code, resourceType, options?)`

### Validation Errors

- `createValidationError(options)` - Generic validation error
- `createRequiredFieldError(fieldName, options?)` - Missing required field
- `createInvalidDateRangeError(options?)` - Invalid date range
- `createDuplicateEntryError(fieldName, value?, options?)` - Duplicate value

### Auth Errors

- `createUnauthorizedError(options?)` - Not logged in
- `createForbiddenError(action?, options?)` - No permission
- `createInsufficientPermissionsError(requiredRole?, options?)`
- `createInvalidCredentialsError(options?)`
- `createSessionExpiredError(options?)`

### Business Logic Errors

- `createBusinessRuleError(rule, options?)`
- `createOperationNotAllowedError(operation, reason?, options?)`
- `createInvalidStateTransitionError(currentState, targetState, options?)`

### External Service Errors

- `createServiceUnavailableError(serviceName, options?)`
- `createSharePointError(operation, options?)` - operation: 'upload' | 'download' | 'auth' | 'permission'
- `createDatabaseError(operation?, options?)`

### System Errors

- `createInternalError(options?)`
- `createUnexpectedError(error, context?)`

### Throwing Helpers (for convenience)

- `throwNotFoundError(resourceType, resourceId?, options?)`
- `throwValidationError(message, fields?)`
- `throwUnauthorizedError(message?)`
- `throwForbiddenError(action?)`
- `throwInternalError(message?)`
- `throwConflictError(resourceType, identifier?)`

## Migration from Old Error Handling

The old helper functions are still available for backward compatibility:

```typescript
// Old way (still works)
import { throwNotFound, throwValidationError } from "@pkg/trpc";
throwNotFound("User");

// New way (recommended)
import { throwNotFoundError, createValidationError } from "@pkg/trpc";
throwNotFoundError("User", userId);
```

Key differences:

1. New functions accept more parameters for context
2. New functions create proper dual messages (user vs developer)
3. New functions include metadata for debugging
4. Validation errors support field-level details

## Best Practices

1. **Use specific error types** - Instead of generic errors, use the appropriate factory function
2. **Include resource context** - Always pass resource type and ID when available
3. **Write user-friendly messages** - Remember the userMessage is shown to end users
4. **Use devMessage for debugging** - Include technical details in devMessage
5. **Handle validation at form level** - Use field-level validation errors for form feedback
6. **Log server errors** - Server errors (5xx) should be monitored
7. **Don't expose sensitive info** - Never include passwords, tokens, or internal paths in user messages
