import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import {
  workOrderTable,
  clientTable,
  officeTable,
  workOrderSiteTable,
  siteTable,
  siteBudgetTable,
  budgetCategoryTable,
  siteActivityTable,
  activityTable,
  siteActivityExpenseTable,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  getWorkOrderSchema,
  getWorkOrdersByOfficeSchema,
  getWorkOrdersByClientSchema,
} from "./work-order.schema";

export const workOrderQueryRouter = router({
  // Get all work orders
  getWorkOrders: publicProcedure.query(async () => {
    try {
      const workOrders = await db
        .select({
          id: workOrderTable.id,
          code: workOrderTable.code,
          title: workOrderTable.title,
          client_id: workOrderTable.client_id,
          client_name: clientTable.name,
          office_id: workOrderTable.office_id,
          office_name: officeTable.name,
          start_date: workOrderTable.start_date,
          end_date: workOrderTable.end_date,
          handing_over_date: workOrderTable.handing_over_date,
          agreement_number: workOrderTable.agreement_number,
          agreement_url: workOrderTable.agreement_url,
          metric_ton: workOrderTable.metric_ton,
          metric_ton_rate: workOrderTable.metric_ton_rate,
          description: workOrderTable.description,
          budget_amount: workOrderTable.budget_amount,
          expense_amount: workOrderTable.expense_amount,
          status: workOrderTable.status,
          cancellation_reason: workOrderTable.cancellation_reason,
          created_at: workOrderTable.created_at,
          updated_at: workOrderTable.updated_at,
        })
        .from(workOrderTable)
        .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
        .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id));

      return workOrders;
    } catch (error) {
      console.error("Error fetching work orders:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch work orders",
      });
    }
  }),

  // Get a single work order by ID with full details
  getWorkOrder: publicProcedure
    .input(getWorkOrderSchema)
    .query(async ({ input }) => {
      try {
        const { id } = input;

        // Get work order basic info
        const workOrders = await db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            client_email: clientTable.email,
            client_contact: clientTable.contact_number,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            agreement_url: workOrderTable.agreement_url,
            metric_ton: workOrderTable.metric_ton,
            metric_ton_rate: workOrderTable.metric_ton_rate,
            description: workOrderTable.description,
            budget_amount: workOrderTable.budget_amount,
            expense_amount: workOrderTable.expense_amount,
            status: workOrderTable.status,
            cancellation_reason: workOrderTable.cancellation_reason,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(eq(workOrderTable.id, id));

        if (workOrders.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Work order not found",
          });
        }

        const workOrder = workOrders[0];

        // Get associated sites
        const woSites = await db
          .select({
            id: workOrderSiteTable.id,
            site_id: workOrderSiteTable.site_id,
            site_name: siteTable.name,
            site_address: siteTable.address,
            site_city: siteTable.city,
            site_state: siteTable.state,
            start_date: workOrderSiteTable.start_date,
            end_date: workOrderSiteTable.end_date,
            metric_ton: workOrderSiteTable.metric_ton,
            metric_ton_rate: workOrderSiteTable.metric_ton_rate,
            budget_amount: workOrderSiteTable.budget_amount,
            status: workOrderSiteTable.status,
          })
          .from(workOrderSiteTable)
          .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
          .where(eq(workOrderSiteTable.work_order_id, id));

        // Get budgets for each site
        const sitesWithBudgets = await Promise.all(
          woSites.map(async (woSite) => {
            const budgets = await db
              .select({
                id: siteBudgetTable.id,
                budget_category_id: siteBudgetTable.budget_category_id,
                category_name: budgetCategoryTable.name,
                budget_amount: siteBudgetTable.budget_amount,
                expense_amount: siteBudgetTable.expense_amount,
              })
              .from(siteBudgetTable)
              .leftJoin(
                budgetCategoryTable,
                eq(siteBudgetTable.budget_category_id, budgetCategoryTable.id)
              )
              .where(eq(siteBudgetTable.wo_site_id, woSite.id));

            return {
              ...woSite,
              budgets,
            };
          })
        );

        return {
          ...workOrder,
          sites: sitesWithBudgets,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching work order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch work order",
        });
      }
    }),

  // Get work orders by office ID
  getWorkOrdersByOffice: publicProcedure
    .input(getWorkOrdersByOfficeSchema)
    .query(async ({ input }) => {
      try {
        const { office_id } = input;

        const workOrders = await db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            office_id: workOrderTable.office_id,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            budget_amount: workOrderTable.budget_amount,
            expense_amount: workOrderTable.expense_amount,
            status: workOrderTable.status,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .where(eq(workOrderTable.office_id, office_id));

        return workOrders;
      } catch (error) {
        console.error("Error fetching work orders by office:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch work orders for office",
        });
      }
    }),

  // Get work orders by client ID
  getWorkOrdersByClient: publicProcedure
    .input(getWorkOrdersByClientSchema)
    .query(async ({ input }) => {
      try {
        const { client_id } = input;

        const workOrders = await db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            client_id: workOrderTable.client_id,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            budget_amount: workOrderTable.budget_amount,
            expense_amount: workOrderTable.expense_amount,
            status: workOrderTable.status,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(eq(workOrderTable.client_id, client_id));

        return workOrders;
      } catch (error) {
        console.error("Error fetching work orders by client:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch work orders for client",
        });
      }
    }),

  // Get work order with full details including sites, budgets, activities, and expenses
  getWorkOrderDetails: publicProcedure
    .input(getWorkOrderSchema)
    .query(async ({ input }) => {
      try {
        const { id } = input;

        // Get work order basic info
        const workOrders = await db
          .select({
            id: workOrderTable.id,
            code: workOrderTable.code,
            title: workOrderTable.title,
            description: workOrderTable.description,
            client_id: workOrderTable.client_id,
            client_name: clientTable.name,
            office_id: workOrderTable.office_id,
            office_name: officeTable.name,
            start_date: workOrderTable.start_date,
            end_date: workOrderTable.end_date,
            handing_over_date: workOrderTable.handing_over_date,
            agreement_number: workOrderTable.agreement_number,
            budget_amount: workOrderTable.budget_amount,
            expense_amount: workOrderTable.expense_amount,
            status: workOrderTable.status,
            cancellation_reason: workOrderTable.cancellation_reason,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(eq(workOrderTable.id, id));

        if (workOrders.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Work order not found",
          });
        }

        const workOrder = workOrders[0];

        // Get all work order sites
        const woSites = await db
          .select({
            wo_site_id: workOrderSiteTable.id,
            site_id: siteTable.id,
            site_name: siteTable.name,
            site_address: siteTable.address,
            site_city: siteTable.city,
            site_state: siteTable.state,
            site_pincode: siteTable.pincode,
            site_contact_person: siteTable.contact_person,
            site_contact_number: siteTable.contact_number,
            site_email: siteTable.email,
            start_date: workOrderSiteTable.start_date,
            end_date: workOrderSiteTable.end_date,
            status: workOrderSiteTable.status,
          })
          .from(workOrderSiteTable)
          .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
          .where(eq(workOrderSiteTable.work_order_id, id));

        // Get site budgets with activities and expenses for each site
        const sitesWithDetails = await Promise.all(
          woSites.map(async (woSite) => {
            // Get budgets for this site
            const budgets = await db
              .select({
                id: siteBudgetTable.id,
                budget_category_id: budgetCategoryTable.id,
                category_name: budgetCategoryTable.name,
                category_description: budgetCategoryTable.description,
                budget_amount: siteBudgetTable.budget_amount,
                expense_amount: siteBudgetTable.expense_amount,
              })
              .from(siteBudgetTable)
              .leftJoin(
                budgetCategoryTable,
                eq(siteBudgetTable.budget_category_id, budgetCategoryTable.id)
              )
              .where(eq(siteBudgetTable.wo_site_id, woSite.wo_site_id));

            // Get activities for this site
            const activities = await db
              .select({
                site_activity_id: siteActivityTable.id,
                activity_id: activityTable.id,
                activity_name: activityTable.name,
                activity_description: activityTable.description,
                status: siteActivityTable.status,
                start_date: siteActivityTable.start_date,
                end_date: siteActivityTable.end_date,
              })
              .from(siteActivityTable)
              .leftJoin(
                activityTable,
                eq(siteActivityTable.activity_id, activityTable.id)
              )
              .where(eq(siteActivityTable.wo_site_id, woSite.wo_site_id));

            // Get expenses for each activity
            const activitiesWithExpenses = await Promise.all(
              activities.map(async (activity) => {
                const expenses = await db
                  .select({
                    id: siteActivityExpenseTable.id,
                    site_budget_id: siteActivityExpenseTable.site_budget_id,
                    budget_category_name: budgetCategoryTable.name,
                    expense_amount: siteActivityExpenseTable.expense_amount,
                    description: siteActivityExpenseTable.description,
                    expense_date: siteActivityExpenseTable.expense_date,
                    category: siteActivityExpenseTable.category,
                    receipt_number: siteActivityExpenseTable.receipt_number,
                  })
                  .from(siteActivityExpenseTable)
                  .leftJoin(
                    siteBudgetTable,
                    eq(
                      siteActivityExpenseTable.site_budget_id,
                      siteBudgetTable.id
                    )
                  )
                  .leftJoin(
                    budgetCategoryTable,
                    eq(
                      siteBudgetTable.budget_category_id,
                      budgetCategoryTable.id
                    )
                  )
                  .where(
                    eq(
                      siteActivityExpenseTable.site_activity_id,
                      activity.site_activity_id
                    )
                  );

                // Calculate total expense for this activity
                const totalExpense = expenses.reduce(
                  (sum, exp) => sum + Number(exp.expense_amount || 0),
                  0
                );

                return {
                  ...activity,
                  total_expense: totalExpense,
                  expenses,
                };
              })
            );

            // Calculate site totals
            const siteTotalBudget = budgets.reduce(
              (sum, b) => sum + Number(b.budget_amount || 0),
              0
            );
            const siteTotalExpense = budgets.reduce(
              (sum, b) => sum + Number(b.expense_amount || 0),
              0
            );

            return {
              site: {
                id: woSite.site_id,
                name: woSite.site_name,
                address: woSite.site_address,
                city: woSite.site_city,
                state: woSite.site_state,
                pincode: woSite.site_pincode,
                contact_person: woSite.site_contact_person,
                contact_number: woSite.site_contact_number,
                email: woSite.site_email,
              },
              wo_site_id: woSite.wo_site_id,
              start_date: woSite.start_date,
              end_date: woSite.end_date,
              status: woSite.status,
              budgets,
              activities: activitiesWithExpenses,
              site_total_budget: siteTotalBudget,
              site_total_expense: siteTotalExpense,
              site_utilization:
                siteTotalBudget > 0
                  ? (siteTotalExpense / siteTotalBudget) * 100
                  : 0,
            };
          })
        );

        // Calculate overall stats
        const totalBudget = sitesWithDetails.reduce(
          (sum, s) => sum + s.site_total_budget,
          0
        );
        const totalExpense = sitesWithDetails.reduce(
          (sum, s) => sum + s.site_total_expense,
          0
        );
        const completedActivities = sitesWithDetails.reduce(
          (sum, s) =>
            sum + s.activities.filter((a) => a.status === "completed").length,
          0
        );

        return {
          workOrder,
          sites: sitesWithDetails,
          stats: {
            total_sites: sitesWithDetails.length,
            completed_activities: completedActivities,
            total_budget: totalBudget,
            total_expense: totalExpense,
            budget_utilization:
              totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching work order details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch work order details",
        });
      }
    }),
});
