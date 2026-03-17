"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthenticationCookies = exports.setAuthenticationCookies = exports.getAccessTokenCookieOptions = exports.getRefreshTokenCookieOptions = void 0;
const dateTimeUtils = __importStar(require("../date-time"));
const { calculateExpirationDate } = dateTimeUtils;
// export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;
const defaults = (node_env) => ({
    httpOnly: true,
    secure: node_env === "production" ? true : false,
    sameSite: node_env === "production" ? "strict" : "lax",
});
const getRefreshTokenCookieOptions = (node_env, expiresIn) => {
    const expires = calculateExpirationDate(expiresIn);
    return {
        ...defaults(node_env),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        expires,
        path: "/", // Changed from REFRESH_PATH to "/" so cookie is available on all routes
    };
};
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const getAccessTokenCookieOptions = (node_env, expiresIn) => {
    const expires = calculateExpirationDate(expiresIn);
    return {
        ...defaults(node_env),
        maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
        expires,
        path: "/",
    };
};
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
const setAuthenticationCookies = ({ res, accessToken, refreshToken, accessExpiresIn, refreshExpiresIn, node_env, }) => res
    .cookie("accessToken", accessToken, (0, exports.getAccessTokenCookieOptions)(node_env, accessExpiresIn))
    .cookie("refreshToken", refreshToken, (0, exports.getRefreshTokenCookieOptions)(node_env, refreshExpiresIn));
exports.setAuthenticationCookies = setAuthenticationCookies;
const clearAuthenticationCookies = (res) => res.clearCookie("accessToken").clearCookie("refreshToken", {
    path: "/",
});
exports.clearAuthenticationCookies = clearAuthenticationCookies;
