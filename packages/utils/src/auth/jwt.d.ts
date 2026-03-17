export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly STAFF: "staff";
    readonly OPERATOR: "operator";
    readonly VIEWER: "viewer";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
/**
 * JWT payload for access tokens
 */
export type JWTPayload = {
    sub: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
};
/**
 * Type for token verification result
 */
export type TokenVerificationResult = {
    success: true;
    payload: JWTPayload;
} | {
    success: false;
    error: string;
};
/**
 * Sign an access token
 */
export declare const signToken: (payload: Omit<JWTPayload, "iat" | "exp">, JWT_SECRET: string, expiresIn: string) => string;
/**
 * Sign a refresh token (contains minimal claims)
 */
export declare const signRefreshToken: (payload: Omit<JWTPayload, "iat" | "exp">, JWT_REFRESH_SECRET: string, expiresIn: string) => string;
/**
 * Verify an access token
 */
export declare const verifyToken: (token: string, JWT_SECRET: string) => JWTPayload;
/**
 * Safely verify an access token, returning a result object instead of throwing
 */
export declare const verifyTokenSafe: (token: string, JWT_SECRET: string) => TokenVerificationResult;
/**
 * Verify a refresh token
 */
export declare const verifyRefreshToken: (token: string, JWT_REFRESH_SECRET: string) => JWTPayload;
/**
 * Safely verify a refresh token
 */
export declare const verifyRefreshTokenSafe: (token: string, JWT_REFRESH_SECRET: string) => TokenVerificationResult;
/**
 * Check if a user role has at least the minimum required role level
 */
export declare const hasMinimumRole: (userRole: UserRole, requiredRole: UserRole) => boolean;
/**
 * Check if a user has one of the allowed roles
 */
export declare const hasAnyOfRoles: (userRole: UserRole, allowedRoles: UserRole[]) => boolean;
