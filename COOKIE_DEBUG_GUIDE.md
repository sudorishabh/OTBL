# Cookie Debugging Guide

## Issues Fixed

✅ **Changed refresh token path from `/auth/refresh` to `/`**

- This allows the refresh token to be sent with all requests, not just the refresh endpoint

✅ **Uncommented `sameSite` and `secure` options**

- `sameSite: "lax"` in development (required for cookies to work)
- `secure: false` in development (required for HTTP cookies)

✅ **Updated logout to use `clearAuthenticationCookies` helper**

- Ensures cookies are cleared with the correct path

## How to Test Cookies are Being Set

### 1. Clear Browser Data

1. Open DevTools (F12)
2. Go to **Application** tab → **Cookies**
3. Delete all cookies for `localhost:3000` and `localhost:7200`

### 2. Login and Check Cookies

1. **Login** at `http://localhost:3000/login`

2. **Open DevTools** → Application → Cookies → `http://localhost:3000`

3. **You should see**:
   ```
   Name              Value                      Path    HttpOnly    Secure    SameSite
   ────────────────────────────────────────────────────────────────────────────────────
   accessToken       <long-jwt-string>          /       ✓           ✗         Lax
   refreshToken      <long-jwt-string>          /       ✓           ✗         Lax
   ```

### 3. Verify Cookie Settings

Both cookies should have:

- ✅ **Path**: `/` (not `/auth/refresh`)
- ✅ **HttpOnly**: `true` (checked)
- ✅ **Secure**: `false` in development (unchecked)
- ✅ **SameSite**: `Lax`

## Common Issues

### Issue: Cookies not showing up at all

**Causes**:

1. CORS not configured properly
2. Client not sending credentials
3. Server not setting cookies

**Solutions**:

1. ✅ Check CORS has `credentials: true` → Already set in `server/src/config/cors.ts`
2. ✅ Check client has `credentials: "include"` → Already set in `Provider.tsx`
3. ✅ Check cookies are being set in login mutation → Already implemented

### Issue: refreshToken cookie not visible in browser

**Cause**: Cookie path was set to `/auth/refresh` instead of `/`

**Solution**: ✅ Fixed - changed path to `/` in `cookie.ts`

### Issue: Cookies not being sent with requests

**Causes**:

1. Cookie domain doesn't match
2. Cookie path too specific
3. SameSite set to "strict" (should be "lax" in dev)

**Solutions**:

1. ✅ Cookies are set without domain (defaults to current domain)
2. ✅ Path is now `/` for both cookies
3. ✅ SameSite is "lax" in development

## Testing the Full Flow

### Step 1: Clear Everything

```bash
# Clear browser cookies (DevTools → Application → Clear storage)
```

### Step 2: Login

1. Go to `http://localhost:3000/login`
2. Enter credentials
3. Click "Sign In"

### Step 3: Check Network Tab

1. Open DevTools → Network
2. Find the `login` request
3. Click on it → Response Headers
4. Look for `Set-Cookie` headers:
   ```
   Set-Cookie: accessToken=<token>; Path=/; HttpOnly; SameSite=Lax
   Set-Cookie: refreshToken=<token>; Path=/; HttpOnly; SameSite=Lax
   ```

### Step 4: Check Application Tab

1. DevTools → Application → Cookies
2. Verify both cookies exist with correct settings

### Step 5: Test Persistence

1. **Reload the page (F5)**

   - You should stay logged in
   - Dashboard shows your user info

2. **Check Network → me request**

   - Request Headers should include:
     ```
     Cookie: accessToken=...; refreshToken=...
     ```

3. **Close and reopen browser**
   - Still logged in ✅

## Debugging Commands

### Check if cookies are being set (Backend)

Add this to your login mutation (temporarily):

```typescript
console.log("Setting cookies...");
console.log("Access Token:", accessToken.substring(0, 20) + "...");
console.log("Refresh Token:", refreshToken.substring(0, 20) + "...");
```

### Check if cookies are being received (Backend)

Add this to your `me` query (temporarily):

```typescript
console.log("Received cookies:", ctx.req.cookies);
```

### Check if cookies are being sent (Frontend)

Open DevTools → Network → Any request → Request Headers → Look for `Cookie` header

## Expected Behavior

### On Login ✅

- Server responds with `Set-Cookie` headers
- Browser stores cookies
- User redirected to dashboard

### On Page Reload ✅

- Browser sends cookies with request
- Server validates access token
- If expired, uses refresh token
- Issues new tokens if needed
- Returns user data

### On Logout ✅

- Cookies are cleared
- User redirected to login
- No cookies in browser

## Restart Your Server!

⚠️ **IMPORTANT**: After making these changes, restart your server:

```bash
# Stop the server (Ctrl+C)
cd server
pnpm dev
```

Then test the login flow again!
