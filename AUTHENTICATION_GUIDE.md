# Authentication & Authorization Guide

This guide shows you how to use authentication and authorization in your tRPC app.

## 📋 Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Usage Examples](#usage-examples)
3. [Role-Based Authorization](#role-based-authorization)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)

---

## 🔐 Authentication Flow

### 1. **Registration**

```typescript
// User registers with email and password
const result = await trpc.user.register.mutate({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123",
  contact_number: "+1234567890",
  role: "staff", // Optional, defaults to "staff"
});
```

### 2. **Login**

```typescript
// User logs in and receives JWT tokens
const result = await trpc.user.login.mutate({
  email: "john@example.com",
  password: "SecurePass123",
});

// Response includes:
// - accessToken (short-lived, 15 minutes)
// - refreshToken (long-lived, 2 days)
// - user object (id, name, email, role, status)
```

### 3. **Making Authenticated Requests**

```typescript
// On the client, include the token in headers
const trpc = createTRPCClient({
  headers: {
    authorization: `Bearer ${accessToken}`,
  },
});

// Now you can call protected procedures
const profile = await trpc.user.me.query();
```

---

## 📚 Usage Examples

### Public Procedures (No Authentication Required)

```typescript
import { router, publicProcedure } from "../../trpc";

export const myRouter = router({
  // Anyone can call this
  getPublicData: publicProcedure.query(async () => {
    return { message: "This is public" };
  }),
});
```

### Protected Procedures (Authentication Required)

```typescript
import { router, protectedProcedure } from "../../trpc";

export const myRouter = router({
  // Only authenticated users can call this
  getPrivateData: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user is available and guaranteed to exist
    const userId = ctx.user.sub; // User ID from JWT
    const userRole = ctx.user.role; // User role
    const userEmail = ctx.user.email; // User email

    return {
      message: `Hello ${userEmail}!`,
      role: userRole,
    };
  }),
});
```

---

## 🛡️ Role-Based Authorization

### Available Roles (in hierarchy order)

1. **admin** - Full system access
2. **manager** - Can manage resources
3. **staff** - Standard access
4. **operator** - Limited operations
5. **viewer** - Read-only access

### Using Role Middleware

#### Option 1: Minimum Role Required

```typescript
import { protectedProcedure } from "../../trpc";
import { hasRole } from "../../middlewares/authorization";

export const adminRouter = router({
  // Only admin or higher can access
  deleteUser: protectedProcedure
    .use(hasRole("admin"))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Only admins reach here
      await db.delete(userTable).where(eq(userTable.id, input.id));
      return { success: true };
    }),

  // Manager or higher (manager, admin) can access
  createOffice: protectedProcedure
    .use(hasRole("manager"))
    .input(officeSchema)
    .mutation(async ({ input }) => {
      // Managers and admins can create offices
      await db.insert(OfficeTable).values(input);
      return { success: true };
    }),
});
```

#### Option 2: Specific Roles Only

```typescript
import { protectedProcedure } from "../../trpc";
import { hasAnyRole } from "../../middlewares/authorization";

export const operationsRouter = router({
  // Only managers and operators can access (not staff or viewers)
  updateWorkOrder: protectedProcedure
    .use(hasAnyRole(["manager", "operator"]))
    .input(workOrderSchema)
    .mutation(async ({ input }) => {
      // Only managers and operators reach here
      return { success: true };
    }),
});
```

#### Option 3: Pre-configured Middleware

```typescript
import { protectedProcedure } from "../../trpc";
import { isAdmin, isManager, isStaff } from "../../middlewares/authorization";

export const userManagementRouter = router({
  // Only admins
  createUser: protectedProcedure
    .use(isAdmin)
    .input(registerSchema)
    .mutation(async ({ input }) => {
      // Admin-only operation
    }),

  // Managers and above
  assignUserToOffice: protectedProcedure
    .use(isManager)
    .input(assignmentSchema)
    .mutation(async ({ input }) => {
      // Manager-level operation
    }),

  // Staff and above
  viewReports: protectedProcedure.use(isStaff).query(async () => {
    // Staff-level operation
  }),
});
```

### Custom Authorization Logic

```typescript
import { protectedProcedure, trpc } from "../../trpc";
import { TRPCError } from "@trpc/server";

// Custom middleware for resource ownership
const canModifyWorkOrder = trpc.middleware(async ({ ctx, next, input }) => {
  const userId = parseInt(ctx.user.sub);
  const workOrderId = (input as any).workOrderId;

  // Check if user is admin or assigned to the office managing this work order
  const [assignment] = await db
    .select()
    .from(UserOfficesTable)
    .innerJoin(
      WorkOrderTable,
      eq(WorkOrderTable.office_id, UserOfficesTable.office_id)
    )
    .where(
      and(
        eq(UserOfficesTable.user_id, userId),
        eq(WorkOrderTable.id, workOrderId)
      )
    );

  if (!assignment && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to modify this work order",
    });
  }

  return next({ ctx });
});

export const workOrderRouter = router({
  updateWorkOrder: protectedProcedure
    .use(canModifyWorkOrder)
    .input(updateWorkOrderSchema)
    .mutation(async ({ input }) => {
      // User has permission to modify this work order
    }),
});
```

---

## 💻 Frontend Integration

### Setting up tRPC Client (React/Next.js)

```typescript
// lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/trpc/router";

export const trpc = createTRPCReact<AppRouter>();

// Provider setup with authentication
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:7200/trpc",
          headers() {
            return {
              authorization: accessToken ? `Bearer ${accessToken}` : "",
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Login Component Example

```typescript
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.user.login.useMutation({
    onSuccess: (data) => {
      // Store the access token
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Redirect or update UI
      console.log("Logged in as:", data.user.name);
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Email'
      />
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Password'
      />
      <button
        type='submit'
        disabled={loginMutation.isLoading}>
        {loginMutation.isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Protected Component Example

```typescript
"use client";

import { trpc } from "@/lib/trpc";

export function UserProfile() {
  const { data: user, isLoading } = trpc.user.me.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Status: {user.status}</p>
    </div>
  );
}
```

### Role-Based UI Rendering

```typescript
"use client";

import { trpc } from "@/lib/trpc";

export function AdminPanel() {
  const { data: user } = trpc.user.me.useQuery();

  // Show admin features only for admins
  if (user?.role !== "admin") {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin-only features */}
    </div>
  );
}

// Or use a helper function
function hasRole(user: any, role: string) {
  const hierarchy = { admin: 5, manager: 4, staff: 3, operator: 2, viewer: 1 };
  return hierarchy[user?.role] >= hierarchy[role];
}

export function ManagerFeatures() {
  const { data: user } = trpc.user.me.useQuery();

  if (!hasRole(user, "manager")) {
    return null; // Don't show anything
  }

  return <div>Manager features here</div>;
}
```

---

## 🧪 Testing

### Testing with Different Roles

```typescript
// Example: Test creating office as manager
const managerToken = await loginAs("manager@example.com", "password");

const result = await fetch("http://localhost:7200/trpc/office.addOffice", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${managerToken}`,
  },
  body: JSON.stringify({
    name: "New Office",
    // ... other fields
  }),
});

// Example: Verify unauthorized access is blocked
const viewerToken = await loginAs("viewer@example.com", "password");

const unauthorizedResult = await fetch(
  "http://localhost:7200/trpc/user.deleteUser",
  {
    method: "POST",
    headers: {
      authorization: `Bearer ${viewerToken}`,
    },
    body: JSON.stringify({ id: 1 }),
  }
);

// Should return 403 Forbidden
expect(unauthorizedResult.status).toBe(403);
```

---

## 🔑 Environment Variables

Make sure you have these in your `.env` file:

```env
JWT_SECRET=your-super-secret-key-here-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRATION=7d
```

---

## 🎯 Quick Reference

### Procedure Types

- **`publicProcedure`** - Anyone can access (no auth required)
- **`protectedProcedure`** - Must be logged in
- **`protectedProcedure.use(isAdmin)`** - Must be admin
- **`protectedProcedure.use(isManager)`** - Must be manager or higher
- **`protectedProcedure.use(hasRole("staff"))`** - Must be staff or higher
- **`protectedProcedure.use(hasAnyRole(["manager", "operator"]))`** - Must be manager OR operator

### Context Available in Protected Procedures

```typescript
ctx.user.sub; // User ID (as string)
ctx.user.email; // User email
ctx.user.role; // User role
```

---

## 🚀 Next Steps

1. **Update your existing routes** to use appropriate authorization
2. **Implement refresh token logic** for seamless token renewal
3. **Add password reset functionality** using JWT_RESET_PASSWORD_SECRET
4. **Implement logout** (token invalidation/blacklisting if needed)
5. **Add 2FA** for enhanced security (optional)
6. **Rate limiting** on login attempts

---

## ⚠️ Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Store JWT secrets securely (never commit to git)
3. ✅ Use short expiration times for access tokens (15 min)
4. ✅ Implement refresh token rotation
5. ✅ Validate and sanitize all inputs
6. ✅ Use bcrypt for password hashing (already done)
7. ✅ Implement rate limiting on authentication endpoints
8. ✅ Log authentication attempts for security auditing
