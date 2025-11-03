// EXAMPLE: Updated office routes with proper authorization

import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { db } from "../../db";
import { OfficeTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { addOfficeSchema, editOfficeSchema } from "./office.schema";
import { isManager, isAdmin } from "../../middlewares/authorization";
import {
  throwNotFound,
  handleDatabaseOperation,
} from "../../utils/trpc-errors";
import { z } from "zod";

export const officeMutationRouterExample = router({
  // Only managers and admins can create offices
  addOffice: protectedProcedure
    .use(isManager) // Requires manager role or higher
    .input(addOfficeSchema)
    .mutation(async ({ input, ctx }) => {
      // ctx.user is guaranteed to exist and be a manager or admin
      const createdBy = parseInt(ctx.user.sub);

      await handleDatabaseOperation(
        () => db.insert(OfficeTable).values(input),
        "Failed to create office"
      );

      return {
        success: true,
        message: "Office created successfully",
      };
    }),

  // Only managers and admins can edit offices
  editOffice: protectedProcedure
    .use(isManager)
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
        message: "Office updated successfully",
      };
    }),

  // Only admins can delete offices
  deleteOffice: protectedProcedure
    .use(isAdmin) // Only admins can delete
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Check if office exists
      const existingOffice = await handleDatabaseOperation(
        () => db.select().from(OfficeTable).where(eq(OfficeTable.id, input.id)),
        "Failed to check office existence"
      );

      if (existingOffice.length === 0) {
        throwNotFound("Office");
      }

      // Delete the office (cascade will handle related records)
      await handleDatabaseOperation(
        () => db.delete(OfficeTable).where(eq(OfficeTable.id, input.id)),
        "Failed to delete office"
      );

      return {
        success: true,
        message: "Office deleted successfully",
      };
    }),

  // Toggle office status (admin only)
  toggleOfficeStatus: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [office] = await db
        .select()
        .from(OfficeTable)
        .where(eq(OfficeTable.id, input.id));

      if (!office) {
        throwNotFound("Office");
      }

      const newStatus = office.status === "active" ? "inactive" : "active";

      await db
        .update(OfficeTable)
        .set({ status: newStatus })
        .where(eq(OfficeTable.id, input.id));

      return {
        success: true,
        message: `Office ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
        newStatus,
      };
    }),
});
