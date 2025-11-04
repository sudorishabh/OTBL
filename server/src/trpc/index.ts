import { TRPCError } from "@trpc/server";
import { transformError } from "./error-transformer";
import { t } from "./context";
import { loggingMiddleware } from "./logging-middleware";

export const router = t.router;

// Error handling middleware
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

// Authentication middleware
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { user: ctx.user } });
});

// Protected procedure - requires authentication
export const protectedProcedure = publicProcedure.use(isAuthed);

// Export middleware creator for custom procedures
export { t as trpc };
