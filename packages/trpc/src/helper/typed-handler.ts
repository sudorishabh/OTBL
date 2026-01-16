import type { TrpcContext, TrpcAuthenticatedContext } from "../context";
import { TRPCError } from "@trpc/server";
import {
  transformToTRPCError,
  createUnauthorizedError,
  createInternalError,
  AppError,
} from "../errors";

/**
 * Handler function type for public procedures
 * Context user may or may not be present
 */
export type Handler<Input = unknown, Output = unknown> = (opts: {
  input: Input;
  ctx: TrpcContext;
}) => Promise<Output> | Output;

/**
 * Handler function type for protected procedures
 * Context user is guaranteed to be present
 */
export type ProtectedHandler<Input = unknown, Output = unknown> = (opts: {
  input: Input;
  ctx: TrpcAuthenticatedContext;
}) => Promise<Output> | Output;

type HandlerOptions = {
  /** Optional message used when an unexpected error occurs inside the handler */
  onErrorMessage?: string;
};

/**
 * Build a wrapper for handlers with error handling
 */
function buildWrapper<Input = unknown, Output = unknown>(
  handler: Handler<Input, Output>,
  options?: HandlerOptions
) {
  return async (opts: { input: Input; ctx: TrpcContext }) => {
    const { input, ctx } = opts || ({} as any);

    if (!ctx) {
      throw createInternalError({
        devMessage: "Missing tRPC context in handler",
      });
    }

    try {
      const result = await handler({ input, ctx });
      return result as Output;
    } catch (error: unknown) {
      // TRPCError and AppError should be re-thrown after transformation
      if (error instanceof TRPCError) {
        throw error;
      }
      if (error instanceof AppError) {
        throw transformToTRPCError(error);
      }

      // Wrap unknown errors
      const message = options?.onErrorMessage ?? "Internal server error";
      throw createInternalError({
        devMessage: error instanceof Error ? error.message : message,
        userMessage: message,
        cause: error,
      });
    }
  };
}

/**
 * Build a wrapper for protected handlers with guaranteed user in context
 */
function buildProtectedWrapper<Input = unknown, Output = unknown>(
  handler: ProtectedHandler<Input, Output>,
  options?: HandlerOptions
) {
  return async (opts: { input: Input; ctx: TrpcAuthenticatedContext }) => {
    const { input, ctx } = opts || ({} as any);

    if (!ctx) {
      throw createInternalError({
        devMessage: "Missing tRPC context in protected handler",
      });
    }

    if (!ctx.user) {
      throw createUnauthorizedError({
        userMessage: "Authentication required",
        devMessage: "No user in context for protected handler",
      });
    }

    try {
      const result = await handler({ input, ctx });
      return result as Output;
    } catch (error: unknown) {
      // TRPCError and AppError should be re-thrown after transformation
      if (error instanceof TRPCError) {
        throw error;
      }
      if (error instanceof AppError) {
        throw transformToTRPCError(error);
      }

      // Wrap unknown errors
      const message = options?.onErrorMessage ?? "Internal server error";
      throw createInternalError({
        devMessage: error instanceof Error ? error.message : message,
        userMessage: message,
        cause: error,
      });
    }
  };
}

/**
 * Wrap a query handler with error handling
 */
export function handleQuery<Input = unknown, Output = unknown>(
  handler: Handler<Input, Output>,
  options?: HandlerOptions
) {
  return buildWrapper(handler, options);
}

/**
 * Wrap a mutation handler with error handling
 */
export function handleMutation<Input = unknown, Output = unknown>(
  handler: Handler<Input, Output>,
  options?: HandlerOptions
) {
  return buildWrapper(handler, options);
}

/**
 * Wrap a protected query handler with error handling
 * Use this for handlers that require authentication
 */
export function handleProtectedQuery<Input = unknown, Output = unknown>(
  handler: ProtectedHandler<Input, Output>,
  options?: HandlerOptions
) {
  return buildProtectedWrapper(handler, options);
}

/**
 * Wrap a protected mutation handler with error handling
 * Use this for handlers that require authentication
 */
export function handleProtectedMutation<Input = unknown, Output = unknown>(
  handler: ProtectedHandler<Input, Output>,
  options?: HandlerOptions
) {
  return buildProtectedWrapper(handler, options);
}
