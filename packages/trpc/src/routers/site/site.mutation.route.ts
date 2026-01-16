import { eq, inArray } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { managerProcedure } from "../../middleware";
import { addSiteSchema, editSiteSchema } from "./site.schema";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const { siteTable, userTable, siteUserTable } = schema;

export const siteMutationRouter = router({
  addSite: managerProcedure.input(addSiteSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { operator_ids, ...siteData } = input;

      ctx.db.transaction(async (tx) => {
        const [createdSite] = await tx
          .insert(siteTable)
          .values(siteData)
          .$returningId();

        if (!createdSite) {
          throwNotFoundError("Site");
        }

        if (operator_ids && operator_ids.length > 0) {
          const users = await tx
            .select()
            .from(userTable)
            .where(inArray(userTable.id, operator_ids));

          if (users.length !== operator_ids.length) {
            throwNotFoundError("Operator");
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

      return { success: true };
    })
  ),

  /**
   * Edit an existing site - Manager or higher
   */
  editSite: managerProcedure.input(editSiteSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const existingSite = await ctx.db
        .select()
        .from(siteTable)
        .where(eq(siteTable.id, input.id));

      if (existingSite.length === 0) {
        throwNotFoundError("Site");
      }

      await handleDatabaseOperation(async () => {
        return ctx.db
          .update(siteTable)
          .set(input)
          .where(eq(siteTable.id, input.id));
      }, "Failed to edit site");

      return { success: true };
    })
  ),
});
