// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
// import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import {
  OfficeTable,
  SiteActivityExpenseTable,
  SiteBudgetTable,
  SiteTable,
  WorkOrderSiteTable,
  WorkOrderTable,
} from "../../db/schema";
import { eq, desc, count } from "drizzle-orm";
import {
  addOfficeSchema,
  getOfficeSchema,
  getOfficeWorkOrderScema,
  getOfficeStatsSchema,
  getOfficesPaginatedSchema,
} from "./office.schema";

export const officeQueryRouter = router({
  getOffices: publicProcedure.query(async () => {
    const offices = await db.select().from(OfficeTable);

    return offices;
  }),

  getOfficesPaginated: publicProcedure
    .input(getOfficesPaginatedSchema)
    .query(async ({ input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(OfficeTable);

      const total = totalResult.count;

      // Get paginated offices
      const offices = await db
        .select()
        .from(OfficeTable)
        .orderBy(desc(OfficeTable.created_at))
        .limit(limit)
        .offset(offset);

      const hasMore = offset + offices.length < total;

      return {
        offices,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  getOffice: publicProcedure.input(getOfficeSchema).query(async ({ input }) => {
    const office = await db
      .select()
      .from(OfficeTable)
      .where(eq(OfficeTable.id, input.id));

    if (!office || office.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Office not found" });
    }

    return office[0];
  }),

  getOfficeWorkOrders: publicProcedure
    .input(getOfficeWorkOrderScema)
    .query(async ({ input }) => {
      const all = await db
        .select()
        .from(WorkOrderTable)
        .where(eq(WorkOrderTable.office_id, input.id));

      const active = all.filter((wo) => wo.status === "pending");
      const completed = all.filter((wo) => wo.status === "completed");

      return { active, completed };
    }),

  getOfficeStats: publicProcedure
    .input(getOfficeStatsSchema)
    .query(async ({ input }) => {
      // Sites associated to office via work orders → work_order_sites
      const workOrders = await db
        .select({ id: WorkOrderTable.id })
        .from(WorkOrderTable)
        .where(eq(WorkOrderTable.office_id, input.id));

      const workOrderIds = workOrders.map((w) => w.id);

      let siteCount = 0;
      let totalBudgetAmount = 0;
      let totalExpenseAmount = 0;
      let completedWorkOrders = 0;

      if (workOrderIds.length > 0) {
        const woSites = await db
          .select({ id: WorkOrderSiteTable.id })
          .from(WorkOrderSiteTable)
          .where(eq(WorkOrderSiteTable.work_order_id, workOrderIds[0]));

        // If multiple work orders, fetch all sites across them
        // Drizzle doesn't support IN with eq directly; do multiple queries if needed
        if (workOrderIds.length > 1) {
          for (let i = 1; i < workOrderIds.length; i++) {
            const more = await db
              .select({ id: WorkOrderSiteTable.id })
              .from(WorkOrderSiteTable)
              .where(eq(WorkOrderSiteTable.work_order_id, workOrderIds[i]));
            woSites.push(...more);
          }
        }

        siteCount = woSites.length;

        // Aggregate budgets and expenses from work_orders directly
        const woRows = await db
          .select({
            status: WorkOrderTable.status,
            budget_amount: WorkOrderTable.budget_amount,
            expense_amount: WorkOrderTable.expense_amount,
          })
          .from(WorkOrderTable)
          .where(eq(WorkOrderTable.office_id, input.id));

        for (const row of woRows) {
          if (row.status === "completed") completedWorkOrders += 1;
          totalBudgetAmount += Number(row.budget_amount);
          totalExpenseAmount += Number(row.expense_amount);
        }
      }

      return {
        siteCount,
        completedWorkOrders,
        totalBudgetAmount,
        totalExpenseAmount,
      };
    }),

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
