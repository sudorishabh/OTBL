# 🔐 OTBL Monorepo — Security Vulnerability Audit

> Audit Date: 2026-04-01 | Scope: Full codebase (`apps/server`, `apps/web`, `packages/`)

---

## 🚨 Critical Vulnerabilities

### 1. Hashed Password & Plaintext Password Exposed in API Response

**File:** `packages/trpc/src/routers/user/user.query.route.ts` — `getCategories8User` (lines 311–320)
**File:** `packages/trpc/src/routers/user/user.mutation.route.ts` — `createUserByAdmin` (line 52)

```diff
// user.query.route.ts — getCategories8User
const userInfoNeeded = {
  id: userTable.id,
  name: userTable.name,
  email: userTable.email,
- password: userTable.password,  // bcrypt hash sent over the wire to any auth user!
  role: userTable.role,
  ...
};

// user.mutation.route.ts — createUserByAdmin return value
return {
  user: {
    name: input.name,
    email: input.email,
-   password: input.password,  // plaintext password echoed back in the response!
    role: input.role,
  },
};
```

**Impact:** Any authenticated user calling `getCategories8User` receives bcrypt hashes of all managers/operators. The `createUserByAdmin` mutation echoes the **plaintext password** back in its response body. Even though bcrypt is one-way, leaking hashes enables offline dictionary attacks. Returning plaintext passwords is a critical data breach.

**Fix:**
- Remove `password` from the `userInfoNeeded` select projection.
- Remove `password` from the `createUserByAdmin` return body.

---

### 2. Real Secrets Committed to Disk in `.env` File

**File:** `apps/server/.env`

```
DATABASE_URL=mysql://root:rishabh11@localhost:3306/otbl
JWT_SECRET=Or2gnO3GthHEXSt...
JWT_REFRESH_SECRET=0LbgjGpH8vSb...
JWT_RESET_PASSWORD_SECRET=CCjgzJ6gis...
SHAREPOINT_CLIENT_SECRET=v8V8Q~F5igVe...
SHAREPOINT_TENANT_ID=0b3ab4ca-fd6e-...
SHAREPOINT_CLIENT_ID=556db221-3fe1-...
```

**Impact:** This file contains real JWT secrets, a real database password, and real Azure Active Directory credentials. If ever committed to Git or accessed via a misconfigured deployment, all secrets are compromised. While `.env` is in `.gitignore`, the secrets themselves are sensitive data.

**Fix:**
- Run `git log -- apps/server/.env` to verify it was never committed.
- Rotate ALL secrets immediately if there is any doubt.
- In production, use a secrets manager (Azure Key Vault, AWS Secrets Manager, Doppler).
- Create an `.env.example` with placeholder values for developer onboarding.

---

### 3. Privilege Escalation — Any User Can Elevate Their Own Role

**File:** `packages/trpc/src/routers/user/user.mutation.route.ts` — `updateUserByAdmin` (lines 59–107)

```typescript
// This endpoint uses protectedProcedure (any logged-in user), NOT adminProcedure
updateUserByAdmin: protectedProcedure
  .input(userSchemas.updateUserSchema)
  .mutation(handleProtectedMutation(async ({ input, ctx }) => {
    const { id, password, ...rest } = input;
    const isAdmin = ctx.user.role === USER_ROLES.ADMIN;
    const isOwnProfile = ctx.user.sub === id.toString();

    if (!isAdmin && !isOwnProfile) {
      throw forbidden("edit this user's profile");
    }

    // rest still contains `role` from the input — no filter applied!
    const updateData: Record<string, any> = { ...rest };
    await ctx.db.update(userTable).set(updateData).where(eq(userTable.id, id));
  }))
```

**Impact:** An `operator` can call `updateUserByAdmin` with their own ID and `{ role: "admin" }` in the payload. The `isOwnProfile` check passes, and the `role` field is included in `updateData`. Any user can self-elevate to admin.

**Fix:**
```typescript
const updateData: Record<string, any> = { ...rest };

// Non-admins cannot change privileged fields
if (!isAdmin) {
  delete updateData.role;
  delete updateData.status;
}
```

---

## ⚠️ High Severity

### 4. SharePoint `testConnection` Leaks Internal Infrastructure Details

**File:** `packages/trpc/src/routers/sharepoint/sharepoint.query.route.ts`, line 22

The `testConnection` endpoint (scoped to `protectedProcedure` — any logged-in user) returns:

```typescript
return {
  ...result,  // includes steps[], details: { configuredUrl, hint, error: full error message }
  configured: true,
};
```

**Impact:** Any authenticated operator/manager receives full SharePoint configuration diagnostics including Azure AD error messages, site URLs, and troubleshooting hints.

**Fix:** Restrict to `adminProcedure` or strip `steps` and `details` for non-admin callers.

---

### 5. No Server-Side Refresh Token Revocation on Logout

**Files:** `packages/trpc/src/routers/auth/auth.mutation.route.ts`

```typescript
logout: publicProcedure.mutation(async ({ ctx }) => {
  clearAuthenticationCookies(ctx.res);  // only clears cookies client-side
  return { success: true };
})
```

**Impact:**
- A stolen refresh token remains valid for the full 7-day lifespan even after logout.
- There is no way to forcefully invalidate a compromised admin session.
- The `authMutation.refreshToken` endpoint also accepts body tokens (for mobile) — these would continue working after logout.

**Fix:**
- Add a `jti` (JWT ID) claim to tokens and a server-side revocation table (DB or Redis).
- On logout, insert the `jti` into the revocation table; verify it on every token use.

---

### 6. Module-Level SharePoint Token Cache (Process-Scoped Global)

**File:** `packages/trpc/src/routers/sharepoint/sharepoint.service.ts`, line 12

```typescript
let tokenCache: TokenCache | null = null;  // shared across all requests in the process
```

**Impact:** If the app ever needs per-tenant or per-config tokens, this global would serve the wrong token. In a horizontally scaled deployment (multiple pods), the cache is not shared, causing frequent unnecessary token fetches. The pattern is a latent bug.

**Fix:** Move token caching to a shared store (Redis) or pass a cache instance per SharePoint config object.

---

### 7. SQL LIKE Wildcard Injection / ReDoS Risk

**File:** `packages/trpc/src/routers/user/user.query.route.ts`, lines 69–73

```typescript
like(userTable.name, `%${searchQuery}%`),
like(userTable.email, `%${searchQuery}%`),
like(userTable.contact_number, `%${searchQuery}%`),
```

**Impact:** A malicious input like `%a%a%a%a%a%a%a%a%a` with many wildcards can cause MySQL to perform catastrophic pattern matching, spiking CPU and causing denial of service. Similar patterns exist in other routers (`client`, `office`, etc.).

**Fix:**
- Add `z.string().max(100)` to all `searchQuery` Zod input validators.
- Escape `%` and `_` characters in user-provided search terms before interpolating.

---

## ⚡ Medium Severity

### 8. Internal Error Messages Leaked in Production

**File:** `apps/server/src/middlewares/error-handler.ts`, line 26

```typescript
return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
  message: "Internal Server Error",
  error: error?.message || "Unknown error occurred",  // DB names, file paths, etc.
});
```

**Fix:**
```typescript
const isDev = process.env.NODE_ENV !== "production";
return res.status(500).json({
  message: "Internal Server Error",
  ...(isDev ? { error: error?.message } : {}),
});
```

---

### 9. Next.js Middleware Checks Cookie Presence, Not JWT Validity

**File:** `apps/web/src/proxy.ts`, lines 20–33

```typescript
const accessToken = req.cookies.get("accessToken")?.value;  // existence only

if (isProtectedRoute && !accessToken && !refreshToken) {
  // redirect to login
}
```

**Impact:** A user can set any arbitrary string as the `accessToken` cookie and bypass the redirect check. This allows them to reach the protected route page shell — though actual data fetching will fail, it indicates the middleware is not a true security boundary.

**Fix:** Verify the JWT signature in the middleware using `jose` (Edge-compatible):

```typescript
import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
try {
  await jwtVerify(accessToken, secret);
  // token is valid
} catch {
  // redirect to login
}
```

> Note: Do NOT expose `JWT_SECRET` publicly. Use the `NEXT_PUBLIC_` prefix **only** if you implement a separate public key (RS256 asymmetric signing).

---

### 10. Anonymous/Public SharePoint Link Creation

**File:** `packages/trpc/src/routers/sharepoint/sharepoint.service.ts`, lines 483–488

```typescript
body: JSON.stringify({
  type,
  scope: "anonymous",  // creates publicly accessible, unauthenticated link
}),
```

**Impact:** Any logged-in user can call `createPublicLink` to generate a publicly accessible link. A leaked URL grants unauthenticated access to documents.

**Fix:**
- Restrict `createPublicLink` mutation to `adminProcedure`.
- Remove `anonymous` scope unless business requirements explicitly demand it.

---

### 11. No File Type / MIME Validation on SharePoint Upload

**File:** `packages/trpc/src/routers/sharepoint/sharepoint.mutation.route.ts`

The upload accepts `content` (base64) and `fileName` without:
- File extension allowlisting
- MIME type validation
- Path traversal sanitization (`..` in `folderPath`/`fileName`)

**Fix:**
```typescript
const ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".docx", ".csv", ".png", ".jpg"];
const ext = path.extname(input.fileName).toLowerCase();
if (!ALLOWED_EXTENSIONS.includes(ext)) {
  throw new Error("File type not allowed");
}
// Sanitize paths
if (input.folderPath.includes("..") || input.fileName.includes("..")) {
  throw new Error("Invalid path");
}
```

---

## 🔵 Low Severity / Informational

### 12. Verbose SharePoint Logging Exposes Azure Client IDs

**File:** `packages/trpc/src/routers/sharepoint/sharepoint.service.ts`, lines 62–65

```typescript
console.log("[SharePoint] Token request params:", {
  client_id: this.config.clientId,
  tenant_id: this.config.tenantId,
});
```

Remove or gate these logs behind `NODE_ENV !== "production"`.

---

### 13. `TrpcAppEnv` Uses `[key: string]: any` Index Signature

**File:** `packages/trpc/src/context.ts`, line 25

```typescript
export type TrpcAppEnv = {
  JWT: { ... };
  NODE_ENV: string;
  [key: string]: any;  // weakens type safety
};
```

Remove the index signature and explicitly type all environment fields.

---

### 14. Auth Rate Limit May Be Too Permissive for Login

**File:** `apps/server/src/index.ts`

`20 req / 15 min` = 80 password guesses/hour per IP. For a login endpoint, consider `5 req / 15 min` for failed attempts specifically.

---

## ✅ Security Strengths

| Area | Status |
|---|---|
| Passwords hashed with bcrypt (12 rounds) | ✅ |
| JWT access tokens short-lived (30m) | ✅ |
| Refresh token rotation on reuse | ✅ |
| httpOnly cookies (prevents XSS token theft) | ✅ |
| Helmet.js for security headers | ✅ |
| CORS origin allowlist (no wildcard) | ✅ |
| Rate limiting on auth routes | ✅ |
| tRPC role middleware (`isAdmin`, `isManager`, etc.) | ✅ |
| Access scope enforcement per user | ✅ |
| Open redirect prevention in Next.js middleware | ✅ |
| `x-middleware-subrequest` header blocked | ✅ |
| Drizzle ORM prevents SQL injection | ✅ |
| `secure: true` + `sameSite: strict` in production | ✅ |

---

## 📋 Priority Fix Summary

| # | Issue | Severity | Effort |
|---|---|---|---|
| 1 | Password hash + plaintext in API response | 🔴 Critical | Low |
| 2 | Real secrets in `.env` disk file | 🔴 Critical | Medium |
| 3 | Self role escalation via `updateUserByAdmin` | 🔴 Critical | Low |
| 4 | Internal SP config exposed in `testConnection` | 🟠 High | Low |
| 5 | No refresh token revocation on logout | 🟠 High | High |
| 6 | Global SP token cache not instance-safe | 🟠 High | Medium |
| 7 | LIKE wildcard injection / ReDoS risk | 🟠 High | Low |
| 8 | `error.message` leaked in prod error handler | 🟡 Medium | Low |
| 9 | Frontend middleware doesn't validate JWT | 🟡 Medium | Medium |
| 10 | Anonymous/public SharePoint link creation | 🟡 Medium | Low |
| 11 | No file type validation on SP upload | 🟡 Medium | Low |
| 12 | Verbose logging with Azure client IDs | 🔵 Low | Low |
| 13 | `[key: string]: any` in env type | 🔵 Low | Low |
| 14 | Auth rate limit too permissive | 🔵 Low | Low |
