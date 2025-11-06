import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { budgetCategoryTable } from "../../db/schema";
import {
  addBudgetCategorySchema,
  editBudgetCategorySchema,
} from "./budget-category.schema";
import { eq } from "drizzle-orm";
import { toLowerAndTrim } from "../../utils/sanitize-string";

export const budgetCategoryMutationRouter = router({
  addBudgetCategory: publicProcedure
    .input(addBudgetCategorySchema)
    .mutation(async ({ input }) => {
      const name = toLowerAndTrim(input.name);
      const description = toLowerAndTrim(input.description);

      try {
        await db.insert(budgetCategoryTable).values({
          name,
          description,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failte to add budget category",
        });
      }

      return { success: true };
    }),

  editBudgetCategory: publicProcedure
    .input(editBudgetCategorySchema)
    .mutation(async ({ input }) => {
      try {
        const exisitngBudgetCategory = await db
          .select()
          .from(budgetCategoryTable)
          .where(eq(budgetCategoryTable.id, input.id));

        if (exisitngBudgetCategory.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No existing budget category present",
          });
        }

        await db
          .update(budgetCategoryTable)
          .set({
            description: input.description,
          })
          .where(eq(budgetCategoryTable.id, input.id));
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit budget activity",
        });
      }
    }),
});
