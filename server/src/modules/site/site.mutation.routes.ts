import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { officeTable, siteTable, workOrderTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { addSiteSchema, editSiteSchema } from "./site.schema";

export const siteMutationRouter = router({
  addSite: publicProcedure.input(addSiteSchema).mutation(async ({ input }) => {
    try {
      await db.insert(siteTable).values(input);

      return {
        success: true,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add site",
      });
    }
  }),

  editSite: publicProcedure
    .input(editSiteSchema)
    .mutation(async ({ input }) => {
      try {
        const existingSite = await db
          .select()
          .from(siteTable)
          .where(eq(siteTable.id, input.id));

        if (existingSite.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Site does not exist",
          });
        }

        await db.update(siteTable).set(input).where(eq(siteTable.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit site",
        });
      }
    }),
});
