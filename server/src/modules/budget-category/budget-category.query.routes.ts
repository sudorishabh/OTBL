import { router, publicProcedure } from "../../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { activityTable, budgetCategoryTable } from "../../db/schema";

export const budgetCategoryQueryRoutes = router({
  getBudgetCategories: publicProcedure.query(async () => {
    const budgetCategories = await db.select().from(budgetCategoryTable);
    return budgetCategories;
  }),
});
