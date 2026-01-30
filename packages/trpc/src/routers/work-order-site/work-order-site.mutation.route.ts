import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { handleMutation } from "../../helper/typed-handler";
import { z } from "zod";

// Define schemas locally
const createSiteActivitySchema = z.object({
  work_order_site_id: z.number().positive(),
  activity: z.string().min(1).max(255),
});

const updateSiteActivitySchema = z.object({
  id: z.number().positive(),
  activity: z.string().min(1).max(255).optional(),
});

const deleteSiteActivitySchema = z.object({
  id: z.number().positive(),
});

const { siteActivityTable } = schema;

export const workOrderSiteMutationRouter = router({
  // Create a site activity
  createSiteActivity: publicProcedure.input(createSiteActivitySchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { work_order_site_id, activity } = input;

      const [result] = await ctx.db.insert(siteActivityTable).values({
        work_order_site_id,
        activity,
      });

      return {
        success: true,
        id: Number(result.insertId),
        message: "Activity created successfully",
      };
    }),
  ),

  // Update a site activity
  updateSiteActivity: publicProcedure.input(updateSiteActivitySchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(siteActivityTable)
        .set(updateData)
        .where(eq(siteActivityTable.id, id));

      return {
        success: true,
        message: "Activity updated successfully",
      };
    }),
  ),

  // Delete a site activity
  deleteSiteActivity: publicProcedure.input(deleteSiteActivitySchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(siteActivityTable)
        .where(eq(siteActivityTable.id, input.id));

      return {
        success: true,
        message: "Activity deleted successfully",
      };
    }),
  ),
});
