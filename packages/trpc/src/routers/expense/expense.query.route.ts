import { eq, sum, desc, and } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure } from "../../core";
import { fromDatabaseError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";
import { z } from "zod";

const {
  workOrderSiteExpenseTable,
  contractorTable,
  cleaningUpSoilAreaTable,
  liftingRecoveryOilSlushTable,
  excavationContSoilTable,
  transportationContSoilTable,
  refillingExcavatedContSoilTable,
  bioremediationContSoilTable,
} = schema;

export const expenseQueryRouter = router({
  getExpenses: protectedProcedure
    .input(z.object({ work_order_site_id: z.number().positive() }))
    .query(
      handleQuery(async ({ input, ctx }) => {
        try {
          const expenses = await ctx.db
            .select({
              id: workOrderSiteExpenseTable.id,
              work_order_site_id: workOrderSiteExpenseTable.work_order_site_id,
              expense_type: workOrderSiteExpenseTable.expense_type,
              contractor_id: workOrderSiteExpenseTable.contractor_id,
              contractor_name: contractorTable.name,
              description: workOrderSiteExpenseTable.description,
              amount: workOrderSiteExpenseTable.amount,
              expense_date: workOrderSiteExpenseTable.expense_date,
              invoice_number: workOrderSiteExpenseTable.invoice_number,
              notes: workOrderSiteExpenseTable.notes,
              created_by: workOrderSiteExpenseTable.created_by,
              created_at: workOrderSiteExpenseTable.created_at,
              updated_at: workOrderSiteExpenseTable.updated_at,
            })
            .from(workOrderSiteExpenseTable)
            .leftJoin(
              contractorTable,
              eq(workOrderSiteExpenseTable.contractor_id, contractorTable.id),
            )
            .where(
              eq(
                workOrderSiteExpenseTable.work_order_site_id,
                input.work_order_site_id,
              ),
            )
            .orderBy(desc(workOrderSiteExpenseTable.expense_date));

          return { expenses };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching expenses");
        }
      }),
    ),

  getExpenseSummary: protectedProcedure
    .input(z.object({ work_order_site_id: z.number().positive() }))
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { work_order_site_id } = input;
        try {
          // Expense breakdown by type
          const rows = await ctx.db
            .select({
              expense_type: workOrderSiteExpenseTable.expense_type,
              total: sum(workOrderSiteExpenseTable.amount),
            })
            .from(workOrderSiteExpenseTable)
            .where(eq(workOrderSiteExpenseTable.work_order_site_id, work_order_site_id))
            .groupBy(workOrderSiteExpenseTable.expense_type);

          const byType: Record<string, number> = {};
          let grandTotal = 0;
          for (const row of rows) {
            const t = Number(row.total ?? 0);
            byType[row.expense_type] = t;
            grandTotal += t;
          }

          // Income total = sum of completion-type amounts across all 6 activity tables
          const completionTables = [
            cleaningUpSoilAreaTable,
            liftingRecoveryOilSlushTable,
            excavationContSoilTable,
            transportationContSoilTable,
            refillingExcavatedContSoilTable,
            bioremediationContSoilTable,
          ] as const;

          const completionResults = await Promise.all(
            completionTables.map((tbl) =>
              ctx.db
                .select({ total: sum((tbl as any).amount) })
                .from(tbl as any)
                .where(
                  and(
                    eq((tbl as any).work_order_site_id, work_order_site_id),
                    eq((tbl as any).type, "completion"),
                  ),
                ),
            ),
          );

          let incomeTotal = 0;
          for (const result of completionResults) {
            incomeTotal += Number(result[0]?.total ?? 0);
          }

          return { byType, grandTotal, incomeTotal };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching expense summary");
        }
      }),
    ),
});
