import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware";
import { workOrderSchemas } from "@pkg/schema";
import { throwNotFoundError } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const { workOrderTable, clientTable, proposalTable, officeTable } = schema;

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
          throwNotFoundError("Client");
        }

        // Validate proposal exists
        const existingProposal = await ctx.db
          .select()
          .from(proposalTable)
          .where(eq(proposalTable.id, input.proposal_id));

        if (existingProposal.length === 0) {
          throwNotFoundError("Proposal");
        }

        // Validate office exists
        const existingOffice = await ctx.db
          .select()
          .from(officeTable)
          .where(eq(officeTable.id, input.office_id));

        if (existingOffice.length === 0) {
          throwNotFoundError("Office");
        }

        // Build work order data object
        const workOrderData = {
          code: input.code,
          agreement_number: input.agreement_number,
          rate_contract_number: input.rate_contract_number,
          title: input.title,
          proposal_id: input.proposal_id,
          client_id: input.client_id,
          office_id: input.office_id,
          start_date: input.start_date,
          end_date: input.end_date,
          handing_over_date: input.handing_over_date,
          agreement_url: input.agreement_url || null,
          document_key: input.document_key,
          metric_ton: input.metric_ton?.toString() || null,
          metric_ton_rate: input.metric_ton_rate?.toString() || null,
          process_type: input.process_type,
          description: input.description || null,
          grand_total_amount: input.grand_total_amount?.toString() || null,
          expense_amount: input.expense_amount.toString(),
          created_by: parseInt(ctx.user!.sub),
        };

        // Create the work order
        const workOrderResult = await ctx.db
          .insert(workOrderTable)
          .values(workOrderData);

        const workOrderId = workOrderResult[0].insertId;

        return {
          success: true,
          workOrderId,
          clientId: input.client_id,
        };
      }),
    ),

  updateWorkOrder: protectedProcedure
    .input(workOrderSchemas.updateWorkOrderSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;

        const existingWorkOrder = await ctx.db
          .select()
          .from(workOrderTable)
          .where(eq(workOrderTable.id, id));

        if (existingWorkOrder.length === 0) {
          throwNotFoundError("Work order");
        }

        const updateValues: Record<string, unknown> = {};

        if (updateData.code) updateValues.code = updateData.code;
        if (updateData.agreement_number)
          updateValues.agreement_number = updateData.agreement_number;
        if (updateData.rate_contract_number)
          updateValues.rate_contract_number = updateData.rate_contract_number;
        if (updateData.title) updateValues.title = updateData.title;
        if (updateData.proposal_id)
          updateValues.proposal_id = updateData.proposal_id;
        if (updateData.office_id) updateValues.office_id = updateData.office_id;
        if (updateData.start_date)
          updateValues.start_date = updateData.start_date;
        if (updateData.end_date) updateValues.end_date = updateData.end_date;
        if (updateData.handing_over_date)
          updateValues.handing_over_date = updateData.handing_over_date;
        if (updateData.agreement_url !== undefined)
          updateValues.agreement_url = updateData.agreement_url || null;
        if (updateData.document_key)
          updateValues.document_key = updateData.document_key;
        if (updateData.metric_ton !== undefined)
          updateValues.metric_ton = updateData.metric_ton?.toString() || null;
        if (updateData.metric_ton_rate !== undefined)
          updateValues.metric_ton_rate =
            updateData.metric_ton_rate?.toString() || null;
        if (updateData.process_type)
          updateValues.process_type = updateData.process_type;
        if (updateData.description !== undefined)
          updateValues.description = updateData.description || null;
        if (updateData.grand_total_amount !== undefined)
          updateValues.grand_total_amount =
            updateData.grand_total_amount?.toString() || null;
        if (updateData.expense_amount !== undefined)
          updateValues.expense_amount = updateData.expense_amount.toString();
        if (updateData.status) updateValues.status = updateData.status;
        if (updateData.cancellation_reason !== undefined)
          updateValues.cancellation_reason = updateData.cancellation_reason;

        await ctx.db
          .update(workOrderTable)
          .set(updateValues)
          .where(eq(workOrderTable.id, id));

        return { success: true };
      }),
    ),

  deleteWorkOrder: protectedProcedure
    .input(workOrderSchemas.deleteWorkOrderSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { id } = input;

        const existingWorkOrder = await ctx.db
          .select()
          .from(workOrderTable)
          .where(eq(workOrderTable.id, id));

        if (existingWorkOrder.length === 0) {
          throwNotFoundError("Work order");
        }

        await ctx.db.delete(workOrderTable).where(eq(workOrderTable.id, id));

        return { success: true };
      }),
    ),
});
