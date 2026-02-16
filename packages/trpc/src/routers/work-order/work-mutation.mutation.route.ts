import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware";
import { workOrderSchemas } from "@pkg/schema";
import { notFound, validationError, fromDatabaseError } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const {
  workOrderTable,
  clientTable,
  proposalTable,
  scheduleOfRatesTable,
  workOrderSiteTable,
  siteActivityTable,
} = schema;

export const workOrderMutationRouter = router({
  createWorkOrder: protectedProcedure
    .input(workOrderSchemas.createWorkOrderSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        // Validate client exists
        const existingClient = await ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.client_id));

        if (existingClient.length === 0) {
          throw notFound("Client", input.client_id, {
            userMessage: "The selected client doesn't exist.",
          });
        }

        // Validate proposal exists
        const existingProposal = await ctx.db
          .select()
          .from(proposalTable)
          .where(eq(proposalTable.id, input.proposal_id));

        if (existingProposal.length === 0) {
          throw notFound("Proposal", input.proposal_id, {
            userMessage: "The selected proposal doesn't exist.",
          });
        }

        // Get office_id from the proposal
        const proposal = existingProposal[0]!;
        const officeId = proposal.office_id;

        // Build work order data object
        const workOrderData = {
          code: input.code,
          agreement_number: input.agreement_number,
          rate_contract_number: input.rate_contract_number,
          title: input.title,
          proposal_id: input.proposal_id,
          client_id: input.client_id,
          office_id: officeId,
          start_date: input?.start_date,
          end_date: input.end_date,
          handing_over_date: input.handing_over_date,
          document_key: input.document_key,
          process_type: input.process_type,
          description: input.description || null,
          created_by: parseInt(ctx.user!.sub),
        };

        try {
          // Create the work order
          const workOrderResult = await ctx.db
            .insert(workOrderTable)
            .values(workOrderData);

          const workOrderId = workOrderResult[0].insertId;

          // Create schedule of rates entries
          if (input.schedule_of_rates && input.schedule_of_rates.length > 0) {
            const scheduleOfRatesData = input.schedule_of_rates.map((sor) => ({
              work_order_id: workOrderId,
              activity: sor.activity,
              unit: sor.unit,
              estimated_quantity: sor.estimated_quantity.toString(),
              rc_unit_rate: sor.rc_unit_rate.toString(),
              gst_percentage: sor.gst_percentage.toString(),
              unit_rate_inc_gst: sor.unit_rate_inc_gst.toString(),
              total_cost: sor.total_cost.toString(),
              transportation_km: sor.transportation_km?.toString() || null,
            }));

            await ctx.db
              .insert(scheduleOfRatesTable)
              .values(scheduleOfRatesData);
          }

          return {
            success: true,
            workOrderId,
            clientId: input.client_id,
          };
        } catch (error) {
          throw fromDatabaseError(error, "Creating work order");
        }
      }),
    ),

  deleteWorkOrder: protectedProcedure
    .input(workOrderSchemas.deleteWorkOrderSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { id } = input;

        // Check if work order exists
        const existingWorkOrder = await ctx.db
          .select()
          .from(workOrderTable)
          .where(eq(workOrderTable.id, id));

        if (existingWorkOrder.length === 0) {
          throw notFound("Work order", id);
        }

        try {
          await ctx.db.delete(workOrderTable).where(eq(workOrderTable.id, id));
          return { success: true };
        } catch (error) {
          throw fromDatabaseError(error, "Deleting work order");
        }
      }),
    ),

  addWorkOrderSite: protectedProcedure
    .input(workOrderSchemas.addWorkOrderSiteSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        // Validate that site_id is provided
        if (!input.site_id) {
          throw validationError("Site ID is required", [
            { field: "site_id", message: "Site ID is required" },
          ]);
        }

        try {
          // Create the work order site
          const [result] = await ctx.db.insert(workOrderSiteTable).values({
            work_order_id: input.work_order_id,
            client_id: input.client_id,
            site_id: input.site_id,
            date: input.date,
            end_date: input.end_date,
            process_type: input.process_type,
            job_number: input.job_number,
            area: input.area,
            installation_type: input.installation_type,
            joint_estimate_number: input.joint_estimate_number,
            land_owner_name: input.land_owner_name,
            remarks: input.remarks || "",
            status: "pending",
          });

          const workOrderSiteId = result.insertId;

          // Create associated site activities if selected
          if (
            input.selected_activities &&
            input.selected_activities.length > 0
          ) {
            const activityValues = input.selected_activities.map(
              (activity) => ({
                work_order_site_id: workOrderSiteId,
                activity: activity,
              }),
            );

            await ctx.db.insert(siteActivityTable).values(activityValues);
          }

          return { success: true, workOrderSiteId };
        } catch (error) {
          throw fromDatabaseError(error, "Adding work order site");
        }
      }),
    ),
});
