import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@pkg/trpc";
import type { inferRouterOutputs } from "@trpc/server";

export const trpc = createTRPCReact<AppRouter>();

// Helper type to infer router outputs
type InferOutput<T> = T extends (...args: any[]) => Promise<infer R>
  ? R
  : T extends { _def: { _output_out: infer O } }
    ? O
    : never;

// export type RouterOutputs = {
//   [K in keyof AppRouter]: {
//     [P in keyof AppRouter[K]]: InferOutput<AppRouter[K][P]>;
//   };
// };

export type RouterOutputs = inferRouterOutputs<AppRouter>;
