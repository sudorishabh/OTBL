"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAnyOfRoles = exports.hasMinimumRole = exports.verifyRefreshTokenSafe = exports.verifyRefreshToken = exports.verifyTokenSafe = exports.verifyToken = exports.signRefreshToken = exports.signToken = exports.ROLE_HIERARCHY = exports.USER_ROLES = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// User roles as a constant for type safety
exports.USER_ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    STAFF: "staff",
    OPERATOR: "operator",
    VIEWER: "viewer",
};
// Role hierarchy for permission checking
exports.ROLE_HIERARCHY = {
    admin: 5,
    manager: 4,
    staff: 3,
    operator: 2,
    viewer: 1,
};
/**
 * Sign an access token
 */
const signToken = (payload, JWT_SECRET, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn,
    });
};
exports.signToken = signToken;
/**
 * Sign a refresh token (contains minimal claims)
 */
const signRefreshToken = (payload, JWT_REFRESH_SECRET, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: expiresIn,
    });
};
exports.signRefreshToken = signRefreshToken;
/**
 * Verify an access token
 */
const verifyToken = (token, JWT_SECRET) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
/**
 * Safely verify an access token, returning a result object instead of throwing
 */
const verifyTokenSafe = (token, JWT_SECRET) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return { success: true, payload };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return { success: false, error: "Token expired" };
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return { success: false, error: "Invalid token" };
        }
        return { success: false, error: "Token verification failed" };
    }
};
exports.verifyTokenSafe = verifyTokenSafe;
/**
 * Verify a refresh token
 */
const verifyRefreshToken = (token, JWT_REFRESH_SECRET) => {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Safely verify a refresh token
 */
const verifyRefreshTokenSafe = (token, JWT_REFRESH_SECRET) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        return { success: true, payload };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return { success: false, error: "Refresh token expired" };
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return { success: false, error: "Invalid refresh token" };
        }
        return { success: false, error: "Refresh token verification failed" };
    }
};
exports.verifyRefreshTokenSafe = verifyRefreshTokenSafe;
/**
 * Check if a user role has at least the minimum required role level
 */
const hasMinimumRole = (userRole, requiredRole) => {
    const userLevel = exports.ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = exports.ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
};
exports.hasMinimumRole = hasMinimumRole;
/**
 * Check if a user has one of the allowed roles
 */
const hasAnyOfRoles = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};
exports.hasAnyOfRoles = hasAnyOfRoles;
