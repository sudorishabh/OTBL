import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@pkg/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// NOTE:
// We keep RouterOutputs strongly typed via AppRouter, but intentionally avoid
// binding the React client proxy type to AppRouter here. In this monorepo setup,
// some router declaration types are not portable during builds, which can cause
// the proxy type to collapse into a diagnostic string union.
export const trpc: any = createTRPCReact<any>();
export type RouterOutputs = inferRouterOutputs<AppRouter>;
