import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import {
  workOrderTable,
  clientTable,
  officeTable,
  workOrderSiteTable,
  siteTable,
} from "../../db/schema";
import { desc, eq } from "drizzle-orm";
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

        return {
          ...workOrder,
          sites: woSites,
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
          .where(eq(workOrderTable.office_id, office_id))
          .orderBy(desc(workOrderTable.created_at));

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

  // Get work order with full details including sites
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
          .where(eq(workOrderTable.id, id))
          .orderBy(desc(workOrderTable.created_at));

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

        const sitesWithDetails = woSites.map((woSite) => ({
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
        }));

        return {
          workOrder,
          sites: sitesWithDetails,
          stats: {
            total_sites: sitesWithDetails.length,
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
