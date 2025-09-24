// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { OfficeTable, WorkOrderTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { addOfficeSchema } from "./office.schema";

export const officeMutationRouter = router({
  // Public: returns JWT on valid credentials
  addOffice: publicProcedure
    .input(addOfficeSchema)
    .mutation(async ({ input }) => {
      await db.insert(OfficeTable).values(input);

      return {
        success: true,
      };
    }),

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
