import { eq, inArray } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { managerProcedure } from "../../middleware";
import { notFound, fromDatabaseError } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";
import { siteSchemas } from "@pkg/schema";

const { siteTable, userTable, siteUserTable } = schema;

export const siteMutationRouter = router({
  createSite: managerProcedure.input(siteSchemas.createSiteSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { operator_ids, ...siteData } = input;

      let siteId: number | undefined;

      try {
        await ctx.db.transaction(async (tx) => {
          const [createdSite] = await tx
            .insert(siteTable)
            .values(siteData)
            .$returningId();

          if (!createdSite) {
            throw notFound("Site", undefined, {
              userMessage: "Failed to create site. Please try again.",
            });
          }

          siteId = createdSite.id;

          if (operator_ids && operator_ids.length > 0) {
            const users = await tx
              .select()
              .from(userTable)
              .where(inArray(userTable.id, operator_ids));

            if (users.length !== operator_ids.length) {
              throw notFound("Operator", undefined, {
                userMessage: "One or more selected operators don't exist.",
              });
            }

            const operatorValues = operator_ids.map((operatorId: number) => ({
              user_id: operatorId,
              site_id: createdSite.id,
              role: "operator" as const,
              office_id: input.office_id,
              assigned_by: parseInt(ctx.user!.sub),
            }));

            await tx.insert(siteUserTable).values(operatorValues);
          }
        });

        return { success: true, id: siteId! };
      } catch (error) {
        // Re-throw AppError instances
        if (error && typeof error === "object" && "errorCode" in error) {
          throw error;
        }
        throw fromDatabaseError(error, "Creating site");
      }
    }),
  ),

  updateSite: managerProcedure.input(siteSchemas.updateSiteSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      // Check if site exists
      const existingSite = await ctx.db
        .select()
        .from(siteTable)
        .where(eq(siteTable.id, input.siteId));

      if (existingSite.length === 0) {
        throw notFound("Site", input.siteId);
      }

      try {
        await ctx.db
          .update(siteTable)
          .set(input)
          .where(eq(siteTable.id, input.siteId));

        return { success: true };
      } catch (error) {
        throw fromDatabaseError(error, "Updating site");
      }
    }),
  ),
});
