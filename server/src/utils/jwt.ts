import jwt from "jsonwebtoken";
import config from "../config/app-env";
import type { JWTPayload } from "../trpc/context";

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.JWT.SECRET, {
    expiresIn: config.JWT.EXPIRES_IN as string,
  });
};

export const signRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.JWT.REFRESH_SECRET as string, {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN as string,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.JWT.SECRET as string) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.JWT.REFRESH_SECRET as string) as JWTPayload;
};
