// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "@/trpc";
import { z } from "zod";
// import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import {
  officeTable,
  workOrderSiteTable,
  workOrderTable,
  officeUserTable,
  userTable,
} from "@/db/schema";
import { eq, desc, count, and, or, like, asc } from "drizzle-orm";
import {
  addOfficeSchema,
  getOfficeSchema,
  getOfficeWorkOrderScema,
  getOfficeStatsSchema,
  getOfficesPaginatedSchema,
  getOfficeUsersSchema,
} from "./office.schema";

export const officeQueryRouter = router({
  getOffices: publicProcedure.query(async () => {
    const offices = await db.select().from(officeTable);

    return offices;
  }),

  getOfficesPaginated: publicProcedure
    .input(getOfficesPaginatedSchema)
    .query(async ({ input }) => {
      const { page, limit, searchQuery, status, officeNamesOrder } = input;
      const offset = (page - 1) * limit;

      // Build query conditions
      let officeQuery = undefined;

      if (status && status !== "all") {
        officeQuery =
          and(officeQuery, eq(officeTable.status, status)) ?? officeQuery;
      }

      if (searchQuery && searchQuery.trim() !== "") {
        officeQuery =
          and(
            officeQuery,
            or(
              like(officeTable.name, `%${searchQuery}%`),
              like(officeTable.address, `%${searchQuery}%`),
              like(officeTable.contact_person, `%${searchQuery}%`),
              like(officeTable.contact_number, `%${searchQuery}%`),
              like(officeTable.email, `%${searchQuery}%`)
            )
          ) ?? officeQuery;
      }

      const officeOrder =
        officeNamesOrder === "asc"
          ? asc(officeTable.name)
          : officeNamesOrder === "desc"
          ? desc(officeTable.name)
          : officeNamesOrder === "latest"
          ? desc(officeTable.created_at)
          : asc(officeTable.created_at);

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(officeTable)
        .where(officeQuery ?? undefined);

      const total = totalResult.count;

      if (total === 0) {
        return {
          offices: [],
          pagination: {
            page,
            limit,
            total,
            hasMore: false,
            totalPages: 0,
          },
        };
      }

      // Get paginated offices
      const offices = await db
        .select()
        .from(officeTable)
        .where(officeQuery ?? undefined)
        .orderBy(officeOrder)
        .limit(limit)
        .offset(offset);

      // Get users for each office
      const officesWithUsers = await Promise.all(
        offices.map(async (office) => {
          const users = await db
            .select({
              id: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: officeUserTable.role,
            })
            .from(officeUserTable)
            .innerJoin(userTable, eq(officeUserTable.user_id, userTable.id))
            .where(eq(officeUserTable.office_id, office.id));

          const manager = users.find((u) => u.role === "manager");
          const operators = users.filter((u) => u.role === "operator");

          return {
            ...office,
            manager,
            operators,
          };
        })
      );

      const hasMore = offset + offices.length < total;

      const totalPages = Math.ceil(total / limit);

      return {
        offices: officesWithUsers,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages,
        },
      };
    }),

  getOffice: publicProcedure.input(getOfficeSchema).query(async ({ input }) => {
    const office = await db
      .select()
      .from(officeTable)
      .where(eq(officeTable.id, input.id));

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
        .from(workOrderTable)
        .where(eq(workOrderTable.office_id, input.id));

      const active = all.filter((wo) => wo.status === "pending");
      const completed = all.filter((wo) => wo.status === "completed");

      return { active, completed };
    }),

  getOfficeStats: publicProcedure
    .input(getOfficeStatsSchema)
    .query(async ({ input }) => {
      // Sites associated to office via work orders → work_order_sites
      const workOrders = await db
        .select({ id: workOrderTable.id })
        .from(workOrderTable)
        .where(eq(workOrderTable.office_id, input.id));

      const workOrderIds = workOrders.map((w) => w.id);

      let siteCount = 0;
      let totalBudgetAmount = 0;
      let totalExpenseAmount = 0;
      let completedWorkOrders = 0;

      if (workOrderIds.length > 0) {
        const woSites = await db
          .select({ id: workOrderSiteTable.id })
          .from(workOrderSiteTable)
          .where(eq(workOrderSiteTable.work_order_id, workOrderIds[0]));

        // If multiple work orders, fetch all sites across them
        // Drizzle doesn't support IN with eq directly; do multiple queries if needed
        if (workOrderIds.length > 1) {
          for (let i = 1; i < workOrderIds.length; i++) {
            const more = await db
              .select({ id: workOrderSiteTable.id })
              .from(workOrderSiteTable)
              .where(eq(workOrderSiteTable.work_order_id, workOrderIds[i]));
            woSites.push(...more);
          }
        }

        siteCount = woSites.length;

        // Aggregate budgets and expenses from work_orders directly
        const woRows = await db
          .select({
            status: workOrderTable.status,
            budget_amount: workOrderTable.budget_amount,
            expense_amount: workOrderTable.expense_amount,
          })
          .from(workOrderTable)
          .where(eq(workOrderTable.office_id, input.id));

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

  getOfficeUsers: publicProcedure
    .input(getOfficeUsersSchema)
    .query(async ({ input }) => {
      const users = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          contact_number: userTable.contact_number,
          role: officeUserTable.role,
          officeUserId: officeUserTable.id,
        })
        .from(officeUserTable)
        .innerJoin(userTable, eq(officeUserTable.user_id, userTable.id))
        .where(eq(officeUserTable.office_id, input.office_id));

      const manager = users.find((u) => u.role === "manager");
      const operators = users.filter((u) => u.role === "operator");

      return {
        manager,
        operators,
        allUsers: users,
      };
    }),

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
