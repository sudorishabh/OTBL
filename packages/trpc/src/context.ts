import type { UserRole } from "@pkg/utils";
import type { Database } from "@pkg/db";

/**
 * Authenticated user from JWT payload
 * This is the user object available in the tRPC context after authentication
 */
export type TrpcUser = {
  sub: string; // User ID as string
  email: string;
  role: UserRole;
};

/**
 * Environment configuration available in context
 */
export type TrpcAppEnv = {
  JWT: {
    SECRET: string;
    EXPIRES_IN: string;
    REFRESH_SECRET: string;
    REFRESH_EXPIRES_IN: string;
  };
  NODE_ENV: string;
  [key: string]: any;
};

/**
 * Base tRPC context - always available
 */
export type TrpcContextBase = {
  req?: { cookies?: Record<string, string> } | undefined;
  res?: any;
  db: Database;
  appEnv: TrpcAppEnv;
};

/**
 * Public context - user may or may not be present
 */
export type TrpcContext = TrpcContextBase & {
  user?: TrpcUser | null;
};

/**
 * Authenticated context - user is guaranteed to be present
 * Used in protected procedures after authentication middleware
 */
export type TrpcAuthenticatedContext = TrpcContextBase & {
  user: TrpcUser;
};

export default TrpcContext;
