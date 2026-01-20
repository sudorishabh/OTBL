import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { constants } from "@pkg/utils";
import { router } from "../../trpc";
import { protectedProcedure, publicProcedure } from "../../core";
import { officeSchemas } from "@pkg/schema";
import { throwNotFoundError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const {
  officeTable,
  officeUserTable,
  userTable,
  workOrderTable,
  workOrderSiteTable,
} = schema;
const { ROLES } = constants;

export const officeQueryRouter = router({
  // Get all offices with users
  getOffices: protectedProcedure.input(officeSchemas.getOfficesSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { searchQuery, status, officeNamesOrder } = input;

      let officeQuery = undefined;

      if (status && status !== "all") {
        officeQuery = and(officeQuery, eq(officeTable.status, status));
      }

      if (searchQuery && searchQuery.trim() !== "") {
        officeQuery = and(
          officeQuery,
          or(
            like(officeTable.name, `%${searchQuery}%`),
            like(officeTable.address, `%${searchQuery}%`),
            like(officeTable.email, `%${searchQuery}%`),
          ),
        );
      }

      const officeOrder =
        officeNamesOrder === "asc"
          ? asc(officeTable.name)
          : officeNamesOrder === "desc"
            ? desc(officeTable.name)
            : officeNamesOrder === "latest"
              ? desc(officeTable.created_at)
              : asc(officeTable.created_at);

      const offices = await ctx.db
        .select()
        .from(officeTable)
        .where(officeQuery)
        .orderBy(officeOrder);

      // Get users for each office
      const officesWithUsers = await Promise.all(
        offices.map(async (office: any) => {
          const users = await ctx.db
            .select({
              id: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: officeUserTable.role,
            })
            .from(officeUserTable)
            .leftJoin(userTable, eq(officeUserTable.user_id, userTable.id))
            .where(eq(officeUserTable.office_id, office.id));

          const manager = users.find((u: any) => u.role === ROLES.MANAGER);
          const operators = users.filter((u: any) => u.role === ROLES.OPERATOR);

          return {
            ...office,
            manager,
            operators,
          };
        }),
      );

      return { offices: officesWithUsers };
    }),
  ),

  // Get a single office by ID
  // getOffice: protectedProcedure.input(getOfficeSchema).query(
  //   handleQuery(async ({ input, ctx }) => {
  //     const office = await ctx.db
  //       .select()
  //       .from(officeTable)
  //       .where(eq(officeTable.id, input.id));

  //     if (!office || office.length === 0) {
  //       throwNotFoundError("Office", input.id);
  //     }

  //     return office[0];
  //   })
  // ),

  // Get work orders for an office
  getOfficeWorkOrders: publicProcedure
    .input(officeSchemas.getOfficeWorkOrderSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const all = await ctx.db
          .select()
          .from(workOrderTable)
          .where(eq(workOrderTable.office_id, input.officeId));

        const active = all.filter((wo: any) => wo.status === "pending");
        const completed = all.filter((wo: any) => wo.status === "completed");

        return { active, completed };
      }),
    ),

  // Get office statistics
  getOfficeStats: publicProcedure
    .input(officeSchemas.getOfficeStatsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const workOrders = await ctx.db
          .select({ id: workOrderTable.id })
          .from(workOrderTable)
          .where(eq(workOrderTable.office_id, input.officeId));

        const workOrderIds = workOrders.map((w: any) => w.id);

        let siteCount = 0;
        let totalBudgetAmount = 0;
        let totalExpenseAmount = 0;
        let completedWorkOrders = 0;

        if (workOrderIds.length > 0) {
          const woSites = await ctx.db
            .select({ id: workOrderSiteTable.id })
            .from(workOrderSiteTable)
            .where(eq(workOrderSiteTable.work_order_id, workOrderIds[0]));

          if (workOrderIds.length > 1) {
            for (let i = 1; i < workOrderIds.length; i++) {
              const more = await ctx.db
                .select({ id: workOrderSiteTable.id })
                .from(workOrderSiteTable)
                .where(eq(workOrderSiteTable.work_order_id, workOrderIds[i]));
              woSites.push(...more);
            }
          }

          siteCount = woSites.length;

          const woRows = await ctx.db
            .select({
              status: workOrderTable.status,
              budget_amount: workOrderTable.grand_total_amount,
              expense_amount: workOrderTable.expense_amount,
            })
            .from(workOrderTable)
            .where(eq(workOrderTable.office_id, input.officeId));

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
    ),

  // Get users assigned to an office
  getOfficeUsers: publicProcedure
    .input(officeSchemas.getOfficeUsersSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const users = await ctx.db
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

        const manager = users.find((u: any) => u.role === "manager");
        const operators = users.filter((u: any) => u.role === "operator");

        return {
          manager,
          operators,
          allUsers: users,
        };
      }),
    ),
});
