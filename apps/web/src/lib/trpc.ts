import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@pkg/trpc";
import type { inferRouterOutputs } from "@trpc/server";

export const trpc: CreateTRPCReact<AppRouter, any> = createTRPCReact<AppRouter>();
export type RouterOutputs = inferRouterOutputs<AppRouter>;
