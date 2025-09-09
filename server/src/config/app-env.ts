import { getEnv } from "../utils/get-env";

export const appEnv = {
  PORT: getEnv("PORT", "7200"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  MOBILE_CLIENT: getEnv("MOBILE_CLIENT"),
  WEB_CLIENT: getEnv("WEB_CLIENT"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRATION", "15m"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRATION", "2d"),
    RESET_PASSWORD_SECRET: getEnv("JWT_RESET_PASSWORD_SECRET"),
    RESET_PASSWORD_EXPIRES_IN: getEnv("JWT_RESET_PASSWORD_EXPIRATION", "1h"),
  },
};

export default appEnv;
