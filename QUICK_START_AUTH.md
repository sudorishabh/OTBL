# 🚀 Quick Start: Authentication in Your App

## Step 1: Environment Setup

Create/update your `.env` file in the `server` folder:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/your_db

# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-characters-change-this
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-change-this
JWT_REFRESH_EXPIRATION=7d
JWT_RESET_PASSWORD_SECRET=your-reset-password-secret-key
JWT_RESET_PASSWORD_EXPIRATION=1h

# CORS
WEB_CLIENT=http://localhost:3000
MOBILE_CLIENT=http://localhost:3000

# Server
PORT=7200
BASE_PATH=/api/v1
```

## Step 2: Create First Admin User

Run this SQL in your database to create the first admin user:

```sql
-- Password: Admin123! (hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$YourBcryptHashHere',  -- Generate this!
  'admin',
  'active'
);
```

Or use this Node.js script to generate the hash:

```javascript
// generate-admin.js
const bcrypt = require("bcrypt");

async function generateAdminPassword() {
  const password = "Admin123!";
  const hash = await bcrypt.hash(password, 10);
  console.log("Password:", password);
  console.log("Hash:", hash);
  console.log("\nSQL:");
  console.log(
    `INSERT INTO users (name, email, password_hash, role, status) VALUES ('Admin User', 'admin@example.com', '${hash}', 'admin', 'active');`
  );
}

generateAdminPassword();
```

Run it: `node generate-admin.js`

## Step 3: Test Authentication

### Test 1: Register a New User

```bash
curl -X POST http://localhost:7200/trpc/user.register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "staff"
  }'
```

### Test 2: Login

```bash
curl -X POST http://localhost:7200/trpc/user.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Response:**

```json
{
  "result": {
    "data": {
      "message": "Login successful",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "status": "active"
      }
    }
  }
}
```

### Test 3: Access Protected Endpoint

```bash
# Replace YOUR_TOKEN with the accessToken from login response
curl -X GET http://localhost:7200/trpc/userQuery.me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 4: Frontend Usage (Next.js/React)

### Install Dependencies

```bash
cd web
pnpm add @trpc/client @trpc/react-query @tanstack/react-query
```

### Create Auth Context

```typescript
// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  user: any;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setAccessToken(token);
  }, []);

  // Fetch user profile when token changes
  const { data: user } = trpc.userQuery.me.useQuery(undefined, {
    enabled: !!accessToken,
  });

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Update TRPC Provider

```typescript
// src/app/_components/Provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function TRPCProviderInner({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient());

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

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TRPCProviderInner>{children}</TRPCProviderInner>
    </AuthProvider>
  );
}
```

### Login Page Example

```typescript
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setAccessToken } = useAuth();

  const loginMutation = trpc.user.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setAccessToken(data.accessToken);
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md space-y-4'>
        <h1 className='text-2xl font-bold'>Login</h1>

        {loginMutation.error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            {loginMutation.error.message}
          </div>
        )}

        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          className='w-full px-4 py-2 border rounded'
          required
        />

        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          className='w-full px-4 py-2 border rounded'
          required
        />

        <button
          type='submit'
          disabled={loginMutation.isLoading}
          className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50'>
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

### Protected Route Example

```typescript
// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <button
          onClick={logout}
          className='px-4 py-2 bg-red-500 text-white rounded'>
          Logout
        </button>
      </div>

      <div className='bg-white p-6 rounded shadow'>
        <h2 className='text-xl font-semibold mb-4'>Welcome, {user.name}!</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Status: {user.status}</p>
      </div>

      {/* Show admin features only for admins */}
      {user.role === "admin" && (
        <div className='mt-8 bg-yellow-50 p-6 rounded shadow'>
          <h3 className='text-lg font-semibold mb-2'>Admin Panel</h3>
          <p>Admin-only features go here</p>
        </div>
      )}
    </div>
  );
}
```

## Step 5: Common API Calls

```typescript
// Login
const login = trpc.user.login.useMutation();
login.mutate({ email: "user@example.com", password: "password" });

// Register
const register = trpc.user.register.useMutation();
register.mutate({
  name: "John",
  email: "john@example.com",
  password: "password123",
  role: "staff",
});

// Get current user
const { data: user } = trpc.userQuery.me.useQuery();

// Change password
const changePassword = trpc.user.changePassword.useMutation();
changePassword.mutate({
  currentPassword: "old",
  newPassword: "new",
});

// Get all users (protected - requires authentication)
const { data: users } = trpc.userQuery.getAll.useQuery();
```

## 🎯 You're All Set!

Your authentication system is now ready. Check `AUTHENTICATION_GUIDE.md` for advanced usage and best practices.
