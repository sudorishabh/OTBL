"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordSync = exports.hashPasswordSync = exports.verifyPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hash to verify against
 * @returns true if password matches hash
 */
const verifyPassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
/**
 * Synchronous password hashing (use sparingly, prefer async version)
 */
const hashPasswordSync = (password) => {
    return bcrypt_1.default.hashSync(password, SALT_ROUNDS);
};
exports.hashPasswordSync = hashPasswordSync;
/**
 * Synchronous password verification (use sparingly, prefer async version)
 */
const verifyPasswordSync = (password, hash) => {
    return bcrypt_1.default.compareSync(password, hash);
};
exports.verifyPasswordSync = verifyPasswordSync;
