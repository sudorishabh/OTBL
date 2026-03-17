/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hash to verify against
 * @returns true if password matches hash
 */
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Synchronous password hashing (use sparingly, prefer async version)
 */
export declare const hashPasswordSync: (password: string) => string;
/**
 * Synchronous password verification (use sparingly, prefer async version)
 */
export declare const verifyPasswordSync: (password: string, hash: string) => boolean;
