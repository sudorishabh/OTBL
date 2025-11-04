# Quick Start: Persistent Authentication

## What Was Implemented

✅ Server-side refresh token validation
✅ Client-side auth hook that auto-checks on mount
✅ Global auth context provider
✅ Protected route component
✅ Updated middleware for route protection
✅ Logout functionality

## Files Created/Modified

### Server (Backend)

- ✏️ `server/src/modules/auth/auth.query.route.ts` - Added `me` query
- ✏️ `server/src/modules/auth/auth.mutation.route.ts` - Added `logout` mutation
- ✏️ `server/src/trpc/context.ts` - Now checks cookies for access token
- ✏️ `server/src/trpc/router.ts` - Added authQuery router

### Client (Frontend)

- ✨ `web/src/hooks/use-auth.ts` - Auth hook (NEW)
- ✨ `web/src/contexts/AuthContext.tsx` - Auth context provider (NEW)
- ✨ `web/src/components/ProtectedRoute.tsx` - Protected route wrapper (NEW)
- ✏️ `web/src/app/_components/Provider.tsx` - Wrapped with AuthProvider
- ✏️ `web/src/middleware.ts` - Updated route protection logic
- ✏️ `web/src/app/dashboard/page.tsx` - Example usage

## How to Use

### 1. In Any Component (Access User Data)

```tsx
"use client";
import { useAuthContext } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, isLoading, logout } = useAuthContext();

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {user && <p>Welcome {user.name}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Protect a Page (Role-Based)

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div>Only admins and managers can see this</div>
    </ProtectedRoute>
  );
}
```

### 3. Check Auth Status Manually

```tsx
"use client";
import { trpc } from "@/lib/trpc";

export default function MyComponent() {
  const { data } = trpc.authQuery.me.useQuery();

  if (data?.success) {
    console.log("User:", data.user);
  }
}
```

## Test It

1. **Start your server**: `cd server && pnpm dev`
2. **Start your web app**: `cd web && pnpm dev`
3. **Login**: Go to `/login` and login
4. **Reload**: Press F5 - you stay logged in ✅
5. **Close browser**: Close and reopen - still logged in ✅
6. **Logout**: Click logout - redirected to login ✅

## Important Notes

- Tokens are stored in **HTTP-only cookies** (secure, cannot be accessed by JS)
- Access token expires in **15 minutes** (configurable)
- Refresh token expires in **7 days** (configurable)
- Middleware protects routes starting with `/dashboard`
- The `me` query automatically refreshes tokens if needed

## What Happens on Page Reload?

1. `AuthProvider` mounts
2. `useAuth` hook runs
3. Calls `authQuery.me` automatically
4. Server checks cookies:
   - Has valid accessToken? → Return user ✅
   - accessToken expired but has refreshToken? → Issue new tokens + Return user ✅
   - No valid tokens? → Return null ❌
5. Client updates auth state
6. Components re-render with user data

## Troubleshooting

**Problem**: User not persisting after reload

- Check browser cookies (DevTools → Application → Cookies)
- Verify `credentials: "include"` in tRPC client (already set in Provider.tsx)

**Problem**: Infinite redirect

- Check middleware logic
- Ensure cookies are named correctly: `accessToken` and `refreshToken`

**Problem**: CORS errors

- Verify CORS is configured on server to allow credentials
- Check that URLs match (http://localhost:7200)

Enjoy your persistent authentication! 🎉
