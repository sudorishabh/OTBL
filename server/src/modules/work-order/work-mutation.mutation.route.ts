import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import {
  workOrderTable,
  clientTable,
  siteTable,
  workOrderSiteTable,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  createWorkOrderSchema,
  editWorkOrderSchema,
  deleteWorkOrderSchema,
} from "./work-order.schema";

export const workOrderMutationRouter = router({
  // Create a new work order with sites
  createWorkOrder: publicProcedure
    .input(createWorkOrderSchema)
    .mutation(async ({ input }) => {
      console.log(
        "🚀 Creating work order with input:",
        JSON.stringify(
          {
            ...input,
            workOrderSites: input.workOrderSites?.map((site, idx) => ({
              index: idx,
              site_id: site.site_id,
            })),
          },
          null,
          2
        )
      );

      try {
        // Defensive: validate dates are parsable
        const isValidDate = (d: any) => {
          if (d instanceof Date) return !isNaN(d.getTime());
          const t = Date.parse(String(d));
          return !isNaN(t);
        };

        if (
          !isValidDate(input.start_date) ||
          !isValidDate(input.end_date) ||
          !isValidDate(input.handing_over_date)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid date(s) provided",
          });
        }

        // Helper: support different insert result shapes
        const getInsertId = (res: any): number => {
          if (!res) return 0;
          // drizzle(mysql2) often returns OkPacket
          if (typeof res.insertId === "number") return res.insertId;
          // sometimes user code accesses [0].insertId
          if (
            Array.isArray(res) &&
            res[0] &&
            typeof res[0].insertId === "number"
          )
            return res[0].insertId;
          return 0;
        };

        // Enforce unique code with friendly error (avoids raw SQL error)
        const existingWOWithCode = await db
          .select({ id: workOrderTable.id })
          .from(workOrderTable)
          .where(eq(workOrderTable.code, input.code));
        if (existingWOWithCode.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Work order code already exists",
          });
        }
        let clientId: number;

        // Step 1: Handle client creation or use existing
        if (input.newClient) {
          // Create new client
          const clientResult = await db.insert(clientTable).values({
            ...input.newClient,
            status: "active",
          });
          clientId = getInsertId(clientResult);
        } else if (input.client_id) {
          // Verify existing client exists
          const existingClient = await db
            .select()
            .from(clientTable)
            .where(eq(clientTable.id, input.client_id));

          if (existingClient.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Client not found",
            });
          }
          clientId = input.client_id;
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Either client_id or newClient must be provided",
          });
        }

        // Step 2: Create the work order
        const workOrderResult = await db.insert(workOrderTable).values({
          code: input.code,
          title: input.title,
          client_id: clientId,
          office_id: input.office_id,
          start_date: new Date(input.start_date),
          end_date: new Date(input.end_date),
          handing_over_date: new Date(input.handing_over_date),
          agreement_number: input.agreement_number,
          agreement_url: input.agreement_url,
          metric_ton: input.metric_ton ? input.metric_ton.toString() : null,
          metric_ton_rate: input.metric_ton_rate
            ? input.metric_ton_rate.toString()
            : null,
          description: input.description,
          budget_amount: input.budget_amount.toString(),
          expense_amount: input.expense_amount.toString(),
          status: input.status,
        });
        const workOrderId = getInsertId(workOrderResult);
        if (!workOrderId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create work order (no insertId)",
          });
        }

        // Step 3: Handle sites (new or existing)
        const siteIds: number[] = [];

        // Create new sites if provided
        if (input.newSites && input.newSites.length > 0) {
          for (const newSite of input.newSites) {
            const siteResult = await db.insert(siteTable).values({
              ...newSite,
              status: "active",
            });
            const sid = getInsertId(siteResult);
            if (!sid) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create site (no insertId)",
              });
            }
            siteIds.push(sid);
          }
        }

        // Add existing site IDs
        if (input.existingSiteIds && input.existingSiteIds.length > 0) {
          // Verify all sites exist
          for (const siteId of input.existingSiteIds) {
            const existingSite = await db
              .select()
              .from(siteTable)
              .where(eq(siteTable.id, siteId));

            if (existingSite.length === 0) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Site with ID ${siteId} not found`,
              });
            }
            siteIds.push(siteId);
          }
        }

        // Step 4: Create work_order_sites entries
        const workOrderSiteIds: number[] = [];

        if (input.workOrderSites && input.workOrderSites.length > 0) {
          // Create work order sites with detailed info
          for (let i = 0; i < input.workOrderSites.length; i++) {
            const woSite = input.workOrderSites[i];
            const siteId = woSite.site_id || siteIds[i];

            if (!siteId) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Site ID is required for work order site",
              });
            }

            const woSiteResult = await db.insert(workOrderSiteTable).values({
              work_order_id: workOrderId,
              site_id: siteId,
              start_date: new Date(woSite.start_date),
              end_date: new Date(woSite.end_date),
              activity_type: woSite.activity_type || null,
              metric_ton: woSite.metric_ton
                ? woSite.metric_ton.toString()
                : null,
              metric_ton_rate: woSite.metric_ton_rate
                ? woSite.metric_ton_rate.toString()
                : null,
              budget_amount: woSite.budget_amount
                ? woSite.budget_amount.toString()
                : null,
              status: "pending",
            });
            const woSiteId = getInsertId(woSiteResult);
            workOrderSiteIds.push(woSiteId);
          }
        } else {
          // Simple case: just link sites without detailed info
          for (const siteId of siteIds) {
            const woSiteResult = await db.insert(workOrderSiteTable).values({
              work_order_id: workOrderId,
              site_id: siteId,
              start_date: new Date(input.start_date),
              end_date: new Date(input.end_date),
              activity_type: null,
              status: "pending",
            });
            workOrderSiteIds.push(getInsertId(woSiteResult));
          }
        }

        return {
          success: true,
          workOrderId,
          clientId: input.newClient ? clientId : undefined,
          newSitesCreated: input.newSites?.length || 0,
          sitesLinked: siteIds.length,
          workOrderSitesCreated: workOrderSiteIds.length,
        };
      } catch (error: any) {
        // Translate common SQL errors to friendly messages
        if (error instanceof TRPCError) {
          throw error;
        }
        const msg = error?.message || String(error);
        console.error("Error creating work order:", msg);
        // Duplicate key on unique code
        if (msg && /duplicate/i.test(msg) && /code/i.test(msg)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Work order code already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create work order",
        });
      }
    }),

  // Edit an existing work order
  editWorkOrder: publicProcedure
    .input(editWorkOrderSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        // Check if work order exists
        const existingWorkOrder = await db
          .select()
          .from(workOrderTable)
          .where(eq(workOrderTable.id, id));

        if (existingWorkOrder.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Work order not found",
          });
        }

        // Prepare update data with proper type conversions
        const updateValues: any = {};

        if (updateData.code) updateValues.code = updateData.code;
        if (updateData.title) updateValues.title = updateData.title;
        if (updateData.client_id) updateValues.client_id = updateData.client_id;
        if (updateData.start_date)
          updateValues.start_date = new Date(updateData.start_date);
        if (updateData.end_date)
          updateValues.end_date = new Date(updateData.end_date);
        if (updateData.handing_over_date)
          updateValues.handing_over_date = new Date(
            updateData.handing_over_date
          );
        if (updateData.agreement_number)
          updateValues.agreement_number = updateData.agreement_number;
        if (updateData.agreement_url !== undefined)
          updateValues.agreement_url = updateData.agreement_url;
        if (updateData.metric_ton !== undefined)
          updateValues.metric_ton = updateData.metric_ton?.toString() || null;
        if (updateData.metric_ton_rate !== undefined)
          updateValues.metric_ton_rate =
            updateData.metric_ton_rate?.toString() || null;
        if (updateData.description)
          updateValues.description = updateData.description;
        if (updateData.budget_amount)
          updateValues.budget_amount = updateData.budget_amount.toString();
        if (updateData.expense_amount !== undefined)
          updateValues.expense_amount = updateData.expense_amount.toString();
        if (updateData.status) updateValues.status = updateData.status;
        if (updateData.cancellation_reason !== undefined)
          updateValues.cancellation_reason = updateData.cancellation_reason;

        // Update the work order
        await db
          .update(workOrderTable)
          .set(updateValues)
          .where(eq(workOrderTable.id, id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating work order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update work order",
        });
      }
    }),

  // Delete a work order
  deleteWorkOrder: publicProcedure
    .input(deleteWorkOrderSchema)
    .mutation(async ({ input }) => {
      try {
        const { id } = input;

        // Check if work order exists
        const existingWorkOrder = await db
          .select()
          .from(workOrderTable)
          .where(eq(workOrderTable.id, id));

        if (existingWorkOrder.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Work order not found",
          });
        }

        // Delete the work order (cascade will handle related records)
        await db.delete(workOrderTable).where(eq(workOrderTable.id, id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error deleting work order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete work order",
        });
      }
    }),
});
