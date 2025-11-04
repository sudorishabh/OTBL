# Persistent User Authentication with tRPC

This implementation provides persistent user authentication using refresh tokens and HTTP-only cookies in your tRPC application.

## Features

✅ **Persistent Sessions** - Users remain logged in after page reload
✅ **Automatic Token Refresh** - Refresh tokens automatically renew access tokens
✅ **HTTP-Only Cookies** - Secure storage of authentication tokens
✅ **Protected Routes** - Middleware-based route protection
✅ **Role-Based Access** - Optional role-based authorization
✅ **Context API** - Global authentication state management

## How It Works

### 1. Server-Side (tRPC)

#### Authentication Query Route (`authQuery.me`)

```typescript
// Located at: server/src/modules/auth/auth.query.route.ts
```

This endpoint:

- Checks if the user has a valid access token
- If access token is invalid/expired, it tries to use the refresh token
- If refresh token is valid, it issues new access and refresh tokens
- Returns user data or null

#### Login Mutation

```typescript
// Located at: server/src/modules/auth/auth.mutation.route.ts
authMutation.login;
```

Sets HTTP-only cookies with access and refresh tokens.

#### Logout Mutation

```typescript
authMutation.logout;
```

Clears authentication cookies.

### 2. Client-Side (Next.js)

#### Auth Hook (`useAuth`)

```typescript
// Located at: web/src/hooks/use-auth.ts
```

Automatically calls `authQuery.me` on mount to check authentication status.

#### Auth Context Provider

```typescript
// Located at: web/src/contexts/AuthContext.tsx
```

Provides global access to:

- `user` - Current user data
- `isLoading` - Loading state
- `isAuthenticated` - Boolean authentication status
- `logout()` - Function to logout user

#### Provider Setup

```typescript
// Located at: web/src/app/_components/Provider.tsx
```

Wraps the app with:

1. tRPC Provider (with credentials: "include")
2. QueryClientProvider
3. AuthProvider

### 3. Middleware Protection

```typescript
// Located at: web/src/middleware.ts
```

- Protects routes like `/dashboard`
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`

## Usage

### 1. Using Auth Context in Components

```typescript
"use client";
import { useAuthContext } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, isLoading, isAuthenticated, logout } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Using Protected Route Component

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>Admin only content</div>
    </ProtectedRoute>
  );
}
```

### 3. Manual tRPC Queries

```typescript
"use client";
import { trpc } from "@/lib/trpc";

export default function MyComponent() {
  const { data, isLoading } = trpc.authQuery.me.useQuery();

  // data will contain { success: true/false, user: {...} | null }
}
```

## Testing the Flow

1. **Login**: Navigate to `/login` and login with credentials
2. **Access Dashboard**: You'll be redirected to `/dashboard`
3. **Reload Page**: Press F5 - you should stay logged in
4. **Close Tab**: Close and reopen the browser - you should stay logged in (until refresh token expires)
5. **Logout**: Click logout button - cookies are cleared and you're redirected to login

## Token Configuration

Tokens are configured in your environment variables:

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m           # Access token expiry
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d    # Refresh token expiry
```

## Security Features

1. **HTTP-Only Cookies** - Tokens cannot be accessed via JavaScript
2. **SameSite Protection** - Prevents CSRF attacks
3. **Secure Flag** - Enabled in production for HTTPS only
4. **Automatic Expiry** - Tokens expire and require re-authentication
5. **Credential Inclusion** - Cookies are sent with every request

## Flow Diagram

```
Page Load
    ↓
useAuth Hook Executes
    ↓
Calls authQuery.me
    ↓
Server checks accessToken cookie
    ↓
    ├─ Valid → Return user data
    │
    ├─ Invalid/Expired → Check refreshToken
    │       ↓
    │       ├─ Valid → Issue new tokens + Return user
    │       │
    │       └─ Invalid → Return null (not authenticated)
    │
    └─ Result sent to client
            ↓
    Context updates user state
            ↓
    Components re-render with auth state
```

## Common Issues

### Cookies not being set

- Ensure `credentials: "include"` is set in tRPC client
- Check CORS configuration on server
- Verify cookie settings (httpOnly, sameSite, secure)

### User not persisting after reload

- Check browser DevTools → Application → Cookies
- Verify tokens are being set with correct domain
- Check token expiration times

### Infinite redirect loop

- Ensure middleware logic doesn't conflict
- Check that protected/public routes are correctly defined
- Verify cookies are being read correctly

## Next Steps

- [ ] Add remember me functionality
- [ ] Implement token blacklisting for logout
- [ ] Add session management (view all sessions)
- [ ] Implement 2FA support
- [ ] Add password reset flow
