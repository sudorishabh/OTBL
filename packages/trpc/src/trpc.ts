import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context";
import { formatErrorForClient } from "./errors";

export const t = initTRPC.context<TrpcContext>().create({
  errorFormatter: formatErrorForClient,
});
export const router = t.router;
export const procedure = t.procedure;
