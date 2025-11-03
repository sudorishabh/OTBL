import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { transformError, errorFormatter } from "./error-transformer";
import { loggingMiddleware } from "./logging-middleware";

const t = initTRPC.context<Context>().create({
  errorFormatter,
});

export { t };
export const router = t.router;

// Enhanced error handling middleware
const errorHandlingMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Transform and throw the error
    throw transformError(error);
  }
});

// Apply middlewares to all procedures (logging first, then error handling)
export const publicProcedure = t.procedure
  .use(loggingMiddleware)
  .use(errorHandlingMiddleware);

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { user: ctx.user } });
});

export const protectedProcedure = publicProcedure.use(isAuthed);
