// src/context.ts
import * as trpcExpress from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import { initTRPC } from "@trpc/server";
export type JWTPayload = { sub: string; email?: string; role?: string };
import { errorFormatter } from "./error-transformer";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const auth = req.headers.authorization;
  let user: JWTPayload | null = null;

  // First, try to get token from Authorization header
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      // invalid/expired token -> user stays null
    }
  }

  // If not in header, try to get from cookies
  if (!user && req.cookies.accessToken) {
    try {
      user = jwt.verify(
        req.cookies.accessToken,
        process.env.JWT_SECRET!
      ) as JWTPayload;
    } catch {
      // invalid/expired token -> user stays null
    }
  }

  return { req, res, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  errorFormatter,
});
