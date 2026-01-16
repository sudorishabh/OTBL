import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hash to verify against
 * @returns true if password matches hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Synchronous password hashing (use sparingly, prefer async version)
 */
export const hashPasswordSync = (password: string): string => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

/**
 * Synchronous password verification (use sparingly, prefer async version)
 */
export const verifyPasswordSync = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};
