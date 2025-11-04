import { router, publicProcedure } from "@/trpc";
import { addActivitySchema, editActivitySchma } from "./activity.schema";

import { toLowerAndTrim } from "@/utils/sanitize-string";
import { db } from "@/db";
import { ActivityTable } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const activityMutationRouter = router({
  addActivity: publicProcedure
    .input(addActivitySchema)
    .mutation(async ({ input }) => {
      const name = toLowerAndTrim(input.name);
      const description = toLowerAndTrim(input.description);

      try {
        await db.insert(ActivityTable).values({
          name,
          description,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add activity",
        });
      }

      return { success: true };
    }),

  editActivity: publicProcedure
    .input(editActivitySchma)
    .mutation(async ({ input }) => {
      try {
        const existingActivity = await db
          .select()
          .from(ActivityTable)
          .where(eq(ActivityTable.id, input.id));

        if (existingActivity.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No existing activity present",
          });
        }

        await db
          .update(ActivityTable)
          .set({
            description: input.description,
          })
          .where(eq(ActivityTable.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit activity",
        });
      }
    }),
});
