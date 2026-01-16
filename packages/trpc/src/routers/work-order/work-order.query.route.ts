import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import {
  getWorkOrderSchema,
  getWorkOrdersByOfficeSchema,
  getWorkOrdersByClientSchema,
  getAllWorkOrdersPaginatedSchema,
} from "./work-order.schema";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const {
  workOrderTable,
  workOrderSiteTable,
  clientTable,
  officeTable,
  siteTable,
  siteUserTable,
  userTable,
} = schema;

export const workOrderQueryRouter = router({
  // Get all work orders with pagination, search, and filters
  getAll: publicProcedure.input(getAllWorkOrdersPaginatedSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { page, limit, searchQuery, status, office_id, workOrderOrder } =
        input;

      let conditions: any = undefined;

      if (status && status !== "all") {
        conditions = and(conditions, eq(workOrderTable.status, status));
      }

      if (office_id) {
        conditions = and(conditions, eq(workOrderTable.office_id, office_id));
      }

      if (searchQuery && searchQuery.trim() !== "") {
        conditions = and(
          conditions,
          or(
            like(workOrderTable.code, `%${searchQuery}%`),
            like(workOrderTable.title, `%${searchQuery}%`),
            like(workOrderTable.agreement_number, `%${searchQuery}%`),
            like(clientTable.name, `%${searchQuery}%`),
            like(officeTable.name, `%${searchQuery}%`)
          )
        );
      }

      const orderBy =
        workOrderOrder === "asc"
          ? asc(workOrderTable.title)
          : workOrderOrder === "desc"
            ? desc(workOrderTable.title)
            : workOrderOrder === "latest"
              ? desc(workOrderTable.created_at)
              : asc(workOrderTable.created_at);

      const [totalResult] = await ctx.db
        .select({ count: count() })
        .from(workOrderTable)
        .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
        .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
        .where(conditions);

      if (!totalResult) {
        throw throwNotFoundError("Work orders not found");
      }

      const total = totalResult.count;

      if (total === 0) {
        return {
          workOrders: [],
          pagination: {
            page,
            limit,
            total,
            hasMore: false,
            totalPages: 0,
          },
        };
      }

      const offset = (page - 1) * limit;

      const workOrders = await handleDatabaseOperation(async () => {
        return ctx.db
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
            budget_amount: workOrderTable.budget_amount,
            expense_amount: workOrderTable.expense_amount,
            status: workOrderTable.status,
            created_at: workOrderTable.created_at,
            updated_at: workOrderTable.updated_at,
          })
          .from(workOrderTable)
          .leftJoin(clientTable, eq(workOrderTable.client_id, clientTable.id))
          .leftJoin(officeTable, eq(workOrderTable.office_id, officeTable.id))
          .where(conditions)
          .limit(limit)
          .offset(offset)
          .orderBy(orderBy);
      }, "Failed to fetch work orders");

      const totalPages = Math.ceil(total / limit);
      const hasMore = offset + workOrders.length < total;

      return {
        workOrders,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages,
        },
      };
    })
  ),

  // Get all work orders (no pagination)
  getWorkOrders: publicProcedure.query(
    handleQuery(async ({ ctx }) => {
      return handleDatabaseOperation(async () => {
        return ctx.db
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
      }, "Failed to fetch work orders");
    })
  ),

  // Get a single work order by ID with full details
  getWorkOrder: publicProcedure.input(getWorkOrderSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { id } = input;

      const workOrders = await ctx.db
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
        throwNotFoundError("Work order");
      }

      const workOrder = workOrders[0];

      const woSites = await ctx.db
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

      return {
        ...workOrder,
        sites: woSites,
      };
    })
  ),

  // Get work orders by office ID
  getWorkOrdersByOffice: publicProcedure
    .input(getWorkOrdersByOfficeSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { office_id } = input;

        return handleDatabaseOperation(async () => {
          return ctx.db
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
            .where(eq(workOrderTable.office_id, office_id))
            .orderBy(desc(workOrderTable.created_at));
        }, "Failed to fetch work orders for office");
      })
    ),

  // Get work orders by client ID
  getWorkOrdersByClient: publicProcedure
    .input(getWorkOrdersByClientSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { client_id } = input;

        return handleDatabaseOperation(async () => {
          return ctx.db
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
        }, "Failed to fetch work orders for client");
      })
    ),

  // Get work order with full details including sites
  getWorkOrderDetails: publicProcedure.input(getWorkOrderSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { id } = input;

      const workOrders = await ctx.db
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
        .where(eq(workOrderTable.id, id))
        .orderBy(desc(workOrderTable.created_at));

      if (workOrders.length === 0) {
        throwNotFoundError("Work order");
      }

      const workOrder = workOrders[0];

      const woSites = await ctx.db
        .select({
          wo_site_id: workOrderSiteTable.id,
          site_id: siteTable.id,
          site_name: siteTable.name,
          site_address: siteTable.address,
          site_city: siteTable.city,
          site_state: siteTable.state,
          site_pincode: siteTable.pincode,
          start_date: workOrderSiteTable.start_date,
          end_date: workOrderSiteTable.end_date,
          status: workOrderSiteTable.status,
          // Additional work order site details
          activity_type: workOrderSiteTable.activity_type,
          metric_ton: workOrderSiteTable.metric_ton,
          metric_ton_rate: workOrderSiteTable.metric_ton_rate,
          budget_amount: workOrderSiteTable.budget_amount,
          total_expense_amount: workOrderSiteTable.total_expense_amount,
        })
        .from(workOrderSiteTable)
        .leftJoin(siteTable, eq(workOrderSiteTable.site_id, siteTable.id))
        .where(eq(workOrderSiteTable.work_order_id, id));

      // console.log(woSites);
      const sitesUsers = await Promise.all(
        woSites.map((woSite: any) =>
          ctx.db
            .select({
              site_id: siteUserTable.site_id,
              user_id: siteUserTable.user_id,
              user_name: userTable.name,
              user_email: userTable.email,
              user_contact_number: userTable.contact_number,
              user_role: userTable.role,
            })
            .from(siteUserTable)
            .leftJoin(userTable, eq(siteUserTable.user_id, userTable.id))
            .where(eq(siteUserTable.site_id, woSite.site_id))
        )
      );

      const sitesWithDetails = woSites.map((woSite: any, index: number) => ({
        site: {
          id: woSite.site_id,
          name: woSite.site_name,
          address: woSite.site_address,
          city: woSite.site_city,
          state: woSite.site_state,
          pincode: woSite.site_pincode,
        },
        wo_site_id: woSite.wo_site_id,
        start_date: woSite.start_date,
        end_date: woSite.end_date,
        status: woSite.status,
        // Additional details
        activity_type: woSite.activity_type,
        metric_ton: woSite.metric_ton,
        metric_ton_rate: woSite.metric_ton_rate,
        budget_amount: woSite.budget_amount,
        total_expense_amount: woSite.total_expense_amount,
        users: sitesUsers[index],
      }));

      return {
        workOrder,
        sites: sitesWithDetails,
        stats: {
          total_sites: sitesWithDetails.length,
        },
      };
    })
  ),
});
