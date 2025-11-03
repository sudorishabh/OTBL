# 📋 Authentication & Authorization Implementation Summary

## ✅ What Was Created

### 1. **User Schema & Validation** (`server/src/modules/user/user.schema.ts`)

- Registration schema with validation
- Login schema
- Password change schema
- Update user schema
- TypeScript types for all inputs

### 2. **JWT Utilities** (`server/src/utils/jwt.ts`)

- Token signing functions
- Token verification functions
- Refresh token support

### 3. **User Mutation Routes** (`server/src/modules/user/user.mutation.route.ts`)

- ✅ `user.register` - Register new users (public)
- ✅ `user.login` - User authentication (public)
- ✅ `user.changePassword` - Change password (protected)

### 4. **User Query Routes** (`server/src/modules/user/user.query.route.ts`)

- ✅ `userQuery.me` - Get current user profile (protected)
- ✅ `userQuery.getAll` - Get all users (protected)
- ✅ `userQuery.getById` - Get user by ID (protected)

### 5. **Authorization Middleware** (`server/src/middlewares/authorization.ts`)

- ✅ `hasRole(minRole)` - Check minimum role level
- ✅ `hasAnyRole([roles])` - Check specific roles
- ✅ `isAdmin` - Admin-only access
- ✅ `isManager` - Manager+ access
- ✅ `isStaff` - Staff+ access

### 6. **Updated Router** (`server/src/trpc/router.ts`)

- Registered user authentication routes
- Organized with clear comments

### 7. **Documentation**

- 📖 `AUTHENTICATION_GUIDE.md` - Comprehensive guide
- 🚀 `QUICK_START_AUTH.md` - Quick start instructions
- 📝 Example file for office routes with authorization

### 8. **Helper Scripts**

- `server/scripts/create-admin.js` - Create first admin user

---

## 🎯 How to Use

### Basic Authentication Flow

```typescript
// 1. Register (Public)
await trpc.user.register.mutate({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123",
  role: "staff",
});

// 2. Login (Public)
const { accessToken, user } = await trpc.user.login.mutate({
  email: "john@example.com",
  password: "SecurePass123",
});

// 3. Use token for authenticated requests
// Include in header: Authorization: Bearer {accessToken}

// 4. Get current user (Protected)
const profile = await trpc.userQuery.me.query();
```

### Role-Based Authorization

```typescript
import { protectedProcedure } from "../../trpc";
import {
  isAdmin,
  isManager,
  hasRole,
  hasAnyRole,
} from "../../middlewares/authorization";

// Example 1: Admin only
export const deleteUser = protectedProcedure
  .use(isAdmin)
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    // Only admins can execute this
  });

// Example 2: Manager or higher
export const createOffice = protectedProcedure
  .use(isManager)
  .input(officeSchema)
  .mutation(async ({ input }) => {
    // Managers and admins can execute this
  });

// Example 3: Specific roles
export const updateWorkOrder = protectedProcedure
  .use(hasAnyRole(["manager", "operator"]))
  .input(workOrderSchema)
  .mutation(async ({ input }) => {
    // Only managers and operators (not staff/viewers)
  });

// Example 4: Custom minimum role
export const viewReports = protectedProcedure
  .use(hasRole("staff"))
  .query(async () => {
    // Staff, manager, and admin can view
  });
```

---

## 🔑 Role Hierarchy

The system has a built-in role hierarchy:

```
admin (level 5)     ← Highest privileges
  ↓
manager (level 4)
  ↓
staff (level 3)
  ↓
operator (level 2)
  ↓
viewer (level 1)    ← Lowest privileges
```

When you use `hasRole("manager")`, it allows:

- ✅ manager
- ✅ admin
- ❌ staff, operator, viewer

---

## 🛠️ Next Steps

### 1. **Apply Authorization to Existing Routes**

Update your existing routes to use proper authorization:

```typescript
// Before (no authorization)
export const officeMutationRouter = router({
  addOffice: publicProcedure.input(schema).mutation(async ({ input }) => {
    // Anyone can create offices!
  }),
});

// After (with authorization)
import { isManager } from "../../middlewares/authorization";

export const officeMutationRouter = router({
  addOffice: protectedProcedure
    .use(isManager)
    .input(schema)
    .mutation(async ({ input, ctx }) => {
      // Only managers and admins can create offices
      const createdBy = parseInt(ctx.user.sub);
      // ...
    }),
});
```

### 2. **Create Admin User**

```bash
cd server

# Option 1: Use the script
node scripts/create-admin.js

# Option 2: Use environment variables
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=YourPassword123! node scripts/create-admin.js
```

### 3. **Frontend Integration**

Follow the examples in `QUICK_START_AUTH.md` to:

- Create auth context
- Update tRPC provider with token headers
- Create login/register pages
- Protect routes based on user roles

### 4. **Add Refresh Token Logic**

Implement token refresh to keep users logged in:

```typescript
// server/src/modules/user/user.mutation.route.ts
refreshToken: publicProcedure
  .input(z.object({ refreshToken: z.string() }))
  .mutation(async ({ input }) => {
    const payload = verifyRefreshToken(input.refreshToken);

    // Generate new tokens
    const accessToken = signToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    return { accessToken, refreshToken: newRefreshToken };
  }),
```

### 5. **Add Password Reset**

```typescript
// Send reset email
requestPasswordReset: publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    // Generate reset token
    // Send email with reset link
  }),

// Reset password
resetPassword: publicProcedure
  .input(z.object({ token: z.string(), newPassword: z.string() }))
  .mutation(async ({ input }) => {
    // Verify token
    // Update password
  }),
```

### 6. **Security Enhancements**

- ✅ Add rate limiting on login attempts
- ✅ Implement account lockout after failed attempts
- ✅ Add 2FA for sensitive operations
- ✅ Log all authentication events
- ✅ Implement session management
- ✅ Add CSRF protection

---

## 📝 Common Patterns

### Pattern 1: Check User Permissions in Code

```typescript
export const updateWorkOrder = protectedProcedure
  .input(workOrderSchema)
  .mutation(async ({ input, ctx }) => {
    const userId = parseInt(ctx.user.sub);
    const userRole = ctx.user.role;

    // Custom permission check
    if (userRole !== "admin") {
      // Check if user is assigned to this office
      const assignment = await db
        .select()
        .from(UserOfficesTable)
        .where(eq(UserOfficesTable.user_id, userId));

      if (!assignment) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
    }

    // User has permission, proceed
  });
```

### Pattern 2: Filter Results by User Access

```typescript
export const getWorkOrders = protectedProcedure.query(async ({ ctx }) => {
  const userId = parseInt(ctx.user.sub);
  const userRole = ctx.user.role;

  // Admins see all work orders
  if (userRole === "admin") {
    return await db.select().from(WorkOrderTable);
  }

  // Others see only their assigned offices' work orders
  return await db
    .select()
    .from(WorkOrderTable)
    .innerJoin(
      UserOfficesTable,
      eq(WorkOrderTable.office_id, UserOfficesTable.office_id)
    )
    .where(eq(UserOfficesTable.user_id, userId));
});
```

### Pattern 3: Audit Trail

```typescript
// Track who modified what
export const updateOffice = protectedProcedure
  .use(isManager)
  .input(editOfficeSchema)
  .mutation(async ({ input, ctx }) => {
    const modifiedBy = parseInt(ctx.user.sub);

    await db
      .update(OfficeTable)
      .set({
        ...input,
        modified_by: modifiedBy,
        modified_at: new Date(),
      })
      .where(eq(OfficeTable.id, input.id));
  });
```

---

## 🔍 Debugging Tips

### Test Authentication

```bash
# Test registration
curl -X POST http://localhost:7200/trpc/user.register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'

# Test login
curl -X POST http://localhost:7200/trpc/user.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Test protected endpoint
curl http://localhost:7200/trpc/userQuery.me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Common Issues

1. **"UNAUTHORIZED" error**

   - Token expired → Login again
   - Token not sent → Check Authorization header
   - Invalid token → Check JWT_SECRET matches

2. **"FORBIDDEN" error**

   - User doesn't have required role
   - Check role hierarchy
   - Verify middleware is applied correctly

3. **TypeScript errors**
   - Run `pnpm install` in both server and web
   - Restart TypeScript server in VS Code
   - Check imports are correct

---

## 📚 Resources

- [tRPC Documentation](https://trpc.io)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 🎉 You're Ready!

Your authentication system is now fully implemented with:

- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Password hashing with bcrypt
- ✅ Protected procedures
- ✅ Type-safe API calls
- ✅ Comprehensive documentation

Start by creating your first admin user and testing the login flow!
