// import { eq } from "drizzle-orm";
// import { schema } from "@pkg/db";
// import { router } from "../../trpc";
// import { protectedProcedure } from "../../middleware";
// import { workOrderSchemas } from "@pkg/schema";
// import { throwNotFoundError, throwValidationError } from "../../errors";
// import { handleMutation } from "../../helper/typed-handler";

// const { workOrderTable, workOrderSiteTable, clientTable } = schema;

// export const workOrderMutationRouter = router({
//   createWorkOrder: protectedProcedure
//     .input(workOrderSchemas.createWorkOrderSchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         // Validate site_ids first
//         if (!input.site_ids || input.site_ids.length === 0) {
//           throwValidationError("At least one site must be provided");
//         }

//         // Validate client exists
//         const existingClient = await ctx.db
//           .select()
//           .from(clientTable)
//           .where(eq(clientTable.id, Number(input.client_id)));

//         if (existingClient.length === 0) {
//           throwNotFoundError("Client");
//         }

//         // Parse numeric values
//         const clientId = Number(input.client_id);
//         const officeId = Number(input.office_id);
//         const proposalId = input.proposal_id ? Number(input.proposal_id) : null;
//         const technologyUsed = Number(input.technology_used);
//         const metricTon = input.metric_ton ? input.metric_ton : null;
//         const metricTonRate = input.metric_ton_rate
//           ? input.metric_ton_rate
//           : null;
//         const budgetAmount = input.budget_amount;
//         const expenseAmount = input.expense_amount ?? "0";

//         // Parse dates
//         const startDate = new Date(input.start_date);
//         const endDate = new Date(input.end_date);
//         const handingOverDate = new Date(input.handing_over_date);

//         // Build work order data object - proposal_id is required in DB
//         const workOrderData: Record<string, unknown> = {
//           code: input.code,
//           title: input.title,
//           client_id: clientId,
//           office_id: officeId,
//           proposal_id: proposalId, // This is required - will throw error if null
//           start_date: startDate,
//           end_date: endDate,
//           handing_over_date: handingOverDate,
//           agreement_number: input.agreement_number,
//           document_key: input.document_key || "",
//           metric_ton: metricTon,
//           metric_ton_rate: metricTonRate,
//           technology_used: technologyUsed,
//           activity_type: input.activity_type,
//           description: input.description || null,
//           budget_amount: budgetAmount,
//           expense_amount: expenseAmount,
//           status: input.status || "pending",
//         };

//         console.log("Creating work order with data:", workOrderData);

//         // Create the work order
//         const workOrderResult = await ctx.db
//           .insert(workOrderTable)
//           .values(workOrderData as any);

//         const workOrderId = workOrderResult[0].insertId;
//         console.log("Work order created with ID:", workOrderId);

//         // Create work order site entries
//         const siteIds: number[] = [];

//         for (const siteId of input.site_ids) {
//           const woSiteData = {
//             work_order_id: workOrderId,
//             client_id: clientId,
//             site_id: Number(siteId),
//             start_date: startDate,
//             end_date: endDate,
//             activity_type: input.activity_type as "insitu" | "exsitu",
//             metric_ton: metricTon,
//             metric_ton_rate: metricTonRate,
//             budget_amount: budgetAmount,
//             status: input.status || "pending",
//           };

//           await ctx.db.insert(workOrderSiteTable).values(woSiteData);
//           siteIds.push(Number(siteId));
//         }

//         return {
//           success: true,
//           workOrderId,
//           clientId: input.client_id,
//           sitesLinked: siteIds.length,
//         };
//       }),
//     ),

//   updateWorkOrder: protectedProcedure.input(editWorkOrderSchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       const { id, ...updateData } = input;

//       const existingWorkOrder = await ctx.db
//         .select()
//         .from(workOrderTable)
//         .where(eq(workOrderTable.id, id));

//       if (existingWorkOrder.length === 0) {
//         throwNotFoundError("Work order");
//       }

//       const updateValues: any = {};

//       if (updateData.code) updateValues.code = updateData.code;
//       if (updateData.title) updateValues.title = updateData.title;
//       if (updateData.client_id) updateValues.client_id = updateData.client_id;
//       if (updateData.start_date)
//         updateValues.start_date = new Date(updateData.start_date);
//       if (updateData.end_date)
//         updateValues.end_date = new Date(updateData.end_date);
//       if (updateData.handing_over_date)
//         updateValues.handing_over_date = new Date(updateData.handing_over_date);
//       if (updateData.agreement_number)
//         updateValues.agreement_number = updateData.agreement_number;
//       if (updateData.metric_ton !== undefined)
//         updateValues.metric_ton = updateData.metric_ton?.toString() || null;
//       if (updateData.metric_ton_rate !== undefined)
//         updateValues.metric_ton_rate =
//           updateData.metric_ton_rate?.toString() || null;
//       if (updateData.technology_used !== undefined)
//         updateValues.technology_used = updateData.technology_used || null;
//       if (updateData.description)
//         updateValues.description = updateData.description;
//       if (updateData.budget_amount)
//         updateValues.budget_amount = updateData.budget_amount.toString();
//       if (updateData.expense_amount !== undefined)
//         updateValues.expense_amount = updateData.expense_amount.toString();
//       if (updateData.status) updateValues.status = updateData.status;
//       if (updateData.cancellation_reason !== undefined)
//         updateValues.cancellation_reason = updateData.cancellation_reason;

//       await ctx.db
//         .update(workOrderTable)
//         .set(updateValues)
//         .where(eq(workOrderTable.id, id));

//       return { success: true };
//     }),
//   ),

//   deleteWorkOrder: protectedProcedure.input(deleteWorkOrderSchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       const { id } = input;

//       const existingWorkOrder = await ctx.db
//         .select()
//         .from(workOrderTable)
//         .where(eq(workOrderTable.id, id));

//       if (existingWorkOrder.length === 0) {
//         throwNotFoundError("Work order");
//       }

//       await ctx.db.delete(workOrderTable).where(eq(workOrderTable.id, id));

//       return { success: true };
//     }),
//   ),
// });
