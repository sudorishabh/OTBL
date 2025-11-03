// src/context.ts
import * as trpcExpress from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";

export type JWTPayload = { sub: string; email?: string; role?: string };

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const auth = req.headers.authorization;
  let user: JWTPayload | null = null;

  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      // invalid/expired token -> user stays null
    }
  }
  return { req, res, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
