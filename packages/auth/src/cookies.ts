import { CookieOptions, Response } from "express";
import { dateTimeUtils } from "@pkg/utils";

const { calculateExpirationDate } = dateTimeUtils;

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
  node_env: string;
};

// export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaults = (node_env: string): CookieOptions => ({
  httpOnly: true,
  secure: node_env === "production" ? true : false,
  sameSite: node_env === "production" ? "strict" : "lax",
});

export const getRefreshTokenCookieOptions = (
  node_env: string,
  expiresIn: string
): CookieOptions => {
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults(node_env),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    expires,
    path: "/", // Changed from REFRESH_PATH to "/" so cookie is available on all routes
  };
};

export const getAccessTokenCookieOptions = (
  node_env: string,
  expiresIn: string
): CookieOptions => {
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults(node_env),
    maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
    expires,
    path: "/",
  };
};

export const setAuthenticationCookies = ({
  res,
  accessToken,
  refreshToken,
  accessExpiresIn,
  refreshExpiresIn,
  node_env,
}: CookiePayloadType): Response =>
  res
    .cookie(
      "accessToken",
      accessToken,
      getAccessTokenCookieOptions(node_env, accessExpiresIn)
    )
    .cookie(
      "refreshToken",
      refreshToken,
      getRefreshTokenCookieOptions(node_env, refreshExpiresIn)
    );

export const clearAuthenticationCookies = (res: Response): Response =>
  res.clearCookie("accessToken").clearCookie("refreshToken", {
    path: "/",
  });
