# Authentication and Authorization System Documentation

## Overview

This document describes the refactored authentication and authorization system for the OTBL application. The system uses:

- **Custom JWT-based authentication** (no NextAuth)
- **httpOnly cookies** for secure token storage
- **bcrypt** for password hashing
- **Role-Based Access Control (RBAC)** with hierarchical roles
- **tRPC** as the single interface for all auth operations

## Architecture

### Packages

| Package       | Purpose                                                             |
| ------------- | ------------------------------------------------------------------- |
| `@pkg/auth`   | JWT signing/verification, bcrypt password hashing, cookie utilities |
| `@pkg/trpc`   | tRPC procedures, context types, authorization middleware            |
| `apps/server` | Express server with tRPC adapter, context creation                  |
| `apps/web`    | Next.js frontend with auth hooks and protected routes               |

### Role Hierarchy

Roles are hierarchical, meaning higher roles have all permissions of lower roles:

| Role       | Level | Description                                     |
| ---------- | ----- | ----------------------------------------------- |
| `admin`    | 5     | Full system access                              |
| `manager`  | 4     | Can manage offices, sites, work orders, clients |
| `staff`    | 3     | Standard staff access                           |
| `operator` | 2     | Can perform site activities                     |
| `viewer`   | 1     | Read-only access                                |

## Server-Side Implementation

### Context Creation (`apps/server/src/context.ts`)

The tRPC context is created for each request and:

1. Attempts to verify JWT from Authorization header (Bearer token)
2. Falls back to httpOnly cookie (`accessToken`)
3. Populates `user` object if token is valid, otherwise `null`

```typescript
export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions): TrpcContext => {
  let user: TrpcUser | null = null;

  // Try Authorization header first, then cookies
  // Verify with verifyTokenSafe (doesn't throw)

  return { req, res, user, db, appEnv };
};
```

### tRPC Procedures (`packages/trpc/src/middleware.ts`)

| Procedure            | Use Case                         |
| -------------------- | -------------------------------- |
| `publicProcedure`    | No authentication required       |
| `protectedProcedure` | Requires authenticated user      |
| `adminProcedure`     | Requires admin role              |
| `managerProcedure`   | Requires manager role or higher  |
| `staffProcedure`     | Requires staff role or higher    |
| `operatorProcedure`  | Requires operator role or higher |

### Authorization Middleware (`packages/trpc/src/authorization.ts`)

```typescript
// Factory for custom role requirements
export const hasRole = (minRole: UserRole) => { ... };
export const hasAnyRole = (allowedRoles: UserRole[]) => { ... };

// Preset middlewares
export const isAdmin = hasRole("admin");
export const isManager = hasRole("manager");
export const isStaff = hasRole("staff");
export const isOperator = hasRole("operator");
```

## Authentication Flow

### Login (`authMutation.login`)

1. User submits email and password
2. Server fetches user by email
3. Server verifies password using bcrypt
4. Server generates access token (30m) and refresh token (7d)
5. Server sets httpOnly cookies
6. Returns user data (without password)

### Session Validation (`authQuery.me`)

1. If `user` in context (from valid access token): fetch full user from DB
2. If no valid access token: try to use refresh token
3. If refresh token valid: generate new tokens (rotation) and return user
4. Otherwise: return `{ success: false, user: null }`

### Automatic Token Refresh (Context Level)

For all tRPC requests, the server context (`apps/server/src/context.ts`) now automatically handles token refresh:

1. First, try to verify access token from Authorization header or cookies
2. If access token is missing/expired but refresh token exists
3. Verify refresh token and generate new access + refresh tokens
4. Set new tokens as httpOnly cookies
5. Continue with the request using the refreshed user context

This means **all protected API calls** will automatically succeed if the refresh token is valid,
even when the access token has expired. No client-side retry needed for this case.

### Client-Side Token Refresh

As a fallback, the client (`apps/web/src/app/_components/Provider.tsx`) also has retry logic:

1. If a request returns HTTP 401 (UNAUTHORIZED)
2. Client attempts to refresh by calling `authQuery.me` endpoint
3. If refresh succeeds, original request is retried automatically
4. Multiple concurrent refresh attempts are deduplicated

### Logout (`authMutation.logout`)

1. Clear httpOnly cookies
2. Return success

## Client-Side Implementation

### Auth Hook (`apps/web/src/hooks/use-auth.ts`)

```typescript
export const useAuth = () => {
  const { data, isLoading, refetch } = trpc.authQuery.me.useQuery();

  return {
    user,
    setUser,
    isUserLoading,
    isAuthenticated: !!user,
    logout,
    refetchUser,
  };
};
```

### Auth Context (`apps/web/src/contexts/AuthContext.tsx`)

Provides auth state to the entire app and includes role-checking hooks:

```typescript
export const useAuthContext = () => { ... };
export const useHasRole = (requiredRole: string) => { ... };
export const useHasAnyRole = (allowedRoles: string[]) => { ... };
export const useIsAdmin = () => useHasRole("admin");
export const useIsManager = () => useHasRole("manager");
export const useIsStaff = () => useHasRole("staff");
```

### Protected Routes (`apps/web/src/components/auth/ProtectedRoute.tsx`)

```tsx
// Basic auth protection
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Role-based protection
<RoleProtectedRoute requiredRole="admin">
  <AdminPage />
</RoleProtectedRoute>

// Multi-role protection
<MultiRoleProtectedRoute allowedRoles={["admin", "manager"]}>
  <ManagementPage />
</MultiRoleProtectedRoute>

// Preset wrappers
<AdminRoute><AdminPage /></AdminRoute>
<ManagerRoute><ManagerPage /></ManagerRoute>
<StaffRoute><StaffPage /></StaffRoute>
```

### Next.js Middleware (`apps/web/src/middleware.ts`)

Handles redirects for protected/public routes based on cookie presence:

- Redirects unauthenticated users from `/dashboard/*` to `/login`
- Redirects authenticated users from `/login` to `/dashboard`

## Password Security

### Hashing (`@pkg/auth/src/bcrypt.ts`)

- Uses bcrypt with 12 salt rounds
- Async functions: `hashPassword()`, `verifyPassword()`
- Sync functions available: `hashPasswordSync()`, `verifyPasswordSync()`

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Token Security

### Access Token

- Short-lived (30 minutes default)
- Contains: `sub` (user ID), `email`, `role`
- Stored in httpOnly cookie

### Refresh Token

- Long-lived (7 days default)
- Contains same claims as access token
- Stored in httpOnly cookie
- Used for token rotation

### Cookie Options

- `httpOnly: true` - Not accessible via JavaScript
- `secure: true` (production) - Only sent over HTTPS
- `sameSite: strict` (production) / `lax` (development)

## Usage Examples

### Creating a Protected Route

```typescript
// In tRPC router
export const myRouter = router({
  // Only authenticated users
  myAction: protectedProcedure.mutation(({ ctx }) => {
    const userId = ctx.user.sub;
    // ...
  }),

  // Only managers or above
  managerAction: managerProcedure.mutation(({ ctx }) => {
    // ctx.user is guaranteed to be a manager+
  }),

  // Custom role check
  customAction: protectedProcedure
    .use(hasAnyRole(["admin", "staff"]))
    .mutation(({ ctx }) => {
      // ...
    }),
});
```

### Checking Roles in Components

```tsx
function MyComponent() {
  const { user, isAuthenticated } = useAuthContext();
  const isAdmin = useIsAdmin();
  const canManage = useHasAnyRole(["admin", "manager"]);

  if (!isAuthenticated) return <LoginPrompt />;
  if (!canManage) return <AccessDenied />;

  return <ManagementContent />;
}
```

## Migration Notes

### For Existing Passwords

Existing passwords stored in plaintext need to be migrated. Run a migration script:

```typescript
import { hashPassword } from "@pkg/auth";

// For each user with plaintext password:
const hashedPassword = await hashPassword(user.password);
await db
  .update(userTable)
  .set({ password: hashedPassword })
  .where(eq(userTable.id, user.id));
```

### Breaking Changes

1. All passwords are now hashed with bcrypt
2. `publicProcedure` mutations are now role-protected
3. Authorization is enforced server-side (not just client)
