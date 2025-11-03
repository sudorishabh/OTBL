// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { OfficeTable, WorkOrderTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { addOfficeSchema, editOfficeSchema } from "./office.schema";
import {
  throwNotFound,
  handleDatabaseOperation,
} from "../../utils/trpc-errors";

export const officeMutationRouter = router({
  // Public: returns JWT on valid credentials
  addOffice: publicProcedure
    .input(addOfficeSchema)
    .mutation(async ({ input }) => {
      await handleDatabaseOperation(
        () => db.insert(OfficeTable).values(input),
        "Failed to create office"
      );

      return {
        success: true,
      };
    }),

  editOffice: publicProcedure
    .input(editOfficeSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      // Check if office exists
      const existingOffice = await handleDatabaseOperation(
        () => db.select().from(OfficeTable).where(eq(OfficeTable.id, id)),
        "Failed to check office existence"
      );

      if (existingOffice.length === 0) {
        throwNotFound("Office");
      }

      // Update the office
      await handleDatabaseOperation(
        () => db.update(OfficeTable).set(rest).where(eq(OfficeTable.id, id)),
        "Failed to update office"
      );

      return {
        success: true,
      };
    }),

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
