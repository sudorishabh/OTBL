// import { eq, and } from "drizzle-orm";
// import { schema } from "@pkg/db";
// import { router } from "../../trpc";
// import { operatorProcedure } from "../../middleware";
// import {
//   createSiteActivitySchema,
//   updateSiteActivitySchema,
//   deleteSiteActivitySchema,
//   addActivityItemSchema,
//   removeActivityItemSchema,
//   createZeroDayActivitySchema,
//   updateZeroDayActivitySchema,
//   createZeroDaySampleSchema,
//   updateZeroDaySampleSchema,
//   createTphActivitySchema,
//   updateTphActivitySchema,
//   createOilZapperActivitySchema,
//   updateOilZapperActivitySchema,
//   deleteActivitySchema,
//   activityPhaseEnum,
// } from "./site-activity.schema";
// import { handleMutation } from "../../helper/typed-handler";
// import { z } from "zod";

// const {
//   zeroDayTable,
//   zeroDaySampleTable,
//   tphTable,
//   oilZapperTable,
//   cleanUpOilSpillTable,
//   liftingOilSlushTable,
//   excavationContSoilTable,
//   trnsprtOilSlushTable,
//   siteActivityTable,
//   siteActivityItemsTable,
// } = schema;

// export const siteActivityMutationRouter = router({
//   createSiteActivity: operatorProcedure
//     .input(createSiteActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const { selected_items, ...activityData } = input;

//         // Insert the site activity
//         const [activity] = await ctx.db.insert(siteActivityTable).values({
//           client_id: activityData.client_id,
//           work_order_id: activityData.work_order_id,
//           work_order_site_id: activityData.work_order_site_id,
//           job_number: activityData.job_number,
//           area: activityData.area,
//           installation: activityData.installation,
//           joint_estimate_number: activityData.joint_estimate_number,
//           land_owner_name: activityData.land_owner_name,
//           start_date: new Date(activityData.start_date),
//           end_date: new Date(activityData.end_date),
//           remark: activityData.remark,
//         });

//         const activityId = Number(activity.insertId);

//         // Insert selected item types into siteActivityItemsTable
//         // Using item_id=0 as a placeholder to indicate the item type is enabled
//         if (selected_items && selected_items.length > 0) {
//           const itemRecords = selected_items.map((itemType) => ({
//             site_activity_id: activityId,
//             item_table_name: itemType,
//             item_id: 0, // Placeholder - actual items will have real IDs
//           }));

//           await ctx.db.insert(siteActivityItemsTable).values(itemRecords);
//         }

//         return { success: true, id: activityId };
//       })
//     ),

//   updateSiteActivity: operatorProcedure
//     .input(updateSiteActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const { id, selected_items, ...updateData } = input;

//         const dataToUpdate: any = { ...updateData };
//         if (updateData.start_date) {
//           dataToUpdate.start_date = new Date(updateData.start_date);
//         }
//         if (updateData.end_date) {
//           dataToUpdate.end_date = new Date(updateData.end_date);
//         }

//         await ctx.db
//           .update(siteActivityTable)
//           .set(dataToUpdate)
//           .where(eq(siteActivityTable.id, id));

//         // Update selected item types if provided
//         if (selected_items !== undefined) {
//           // Delete existing placeholder items (item_id = 0)
//           await ctx.db
//             .delete(siteActivityItemsTable)
//             .where(
//               and(
//                 eq(siteActivityItemsTable.site_activity_id, id),
//                 eq(siteActivityItemsTable.item_id, 0)
//               )
//             );

//           // Insert new selected item types
//           if (selected_items.length > 0) {
//             const itemRecords = selected_items.map((itemType) => ({
//               site_activity_id: id,
//               item_table_name: itemType,
//               item_id: 0, // Placeholder
//             }));

//             await ctx.db.insert(siteActivityItemsTable).values(itemRecords);
//           }
//         }

//         return { success: true };
//       })
//     ),

//   deleteSiteActivity: operatorProcedure
//     .input(deleteSiteActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         await ctx.db
//           .delete(siteActivityTable)
//           .where(eq(siteActivityTable.id, input.id));

//         return { success: true };
//       })
//     ),

//   createActivityItem: operatorProcedure.input(addActivityItemSchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       const [item] = await ctx.db.insert(siteActivityItemsTable).values({
//         site_activity_id: input.site_activity_id,
//         item_table_name: input.item_table_name,
//         item_id: input.item_id,
//       });

//       return { success: true, id: item.insertId };
//     })
//   ),

//   removeActivityItem: operatorProcedure
//     .input(removeActivityItemSchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         await ctx.db
//           .delete(siteActivityItemsTable)
//           .where(eq(siteActivityItemsTable.id, input.id));

//         return { success: true };
//       })
//     ),

//   linkItemToActivity: operatorProcedure
//     .input(
//       z.object({
//         site_activity_id: z.number().positive(),
//         item_table_name: z.string(),
//         item_id: z.number().positive(),
//       })
//     )
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const [existing] = await ctx.db
//           .select()
//           .from(siteActivityItemsTable)
//           .where(
//             and(
//               eq(
//                 siteActivityItemsTable.site_activity_id,
//                 input.site_activity_id
//               ),
//               eq(siteActivityItemsTable.item_table_name, input.item_table_name),
//               eq(siteActivityItemsTable.item_id, input.item_id)
//             )
//           )
//           .limit(1);

//         if (existing) {
//           return { success: true, id: existing.id, existed: true };
//         }

//         let table;
//         switch (input.item_table_name) {
//           case "zero_days":
//             table = zeroDayTable;
//             break;
//           case "zero_day_samples":
//             table = zeroDaySampleTable;
//             break;
//           case "tph":
//             table = tphTable;
//             break;
//           case "oil_zappers":
//             table = oilZapperTable;
//             break;
//           case "clean_up_oil_spill":
//             table = cleanUpOilSpillTable;
//             break;
//           case "lifting_oil_slush":
//             table = liftingOilSlushTable;
//             break;
//           case "excavation_cont_soil":
//             table = excavationContSoilTable;
//             break;
//           case "trnsprt_oil_slush":
//             table = trnsprtOilSlushTable;
//             break;
//         }

//         if (table) {
//           await ctx.db
//             .update(table)
//             .set({ site_activity_id: input.site_activity_id })
//             .where(eq(table.id, input.item_id));
//         }

//         // Create the link in site_activity_items
//         const [item] = await ctx.db.insert(siteActivityItemsTable).values({
//           site_activity_id: input.site_activity_id,
//           item_table_name: input.item_table_name,
//           item_id: input.item_id,
//         });

//         return { success: true, id: item.insertId, existed: false };
//       })
//     ),

//   // Unlink item from a site activity
//   unlinkItemFromActivity: operatorProcedure
//     .input(
//       z.object({
//         site_activity_id: z.number().positive(),
//         item_table_name: z.string(),
//         item_id: z.number().positive(),
//       })
//     )
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         // Update the item's site_activity_id to null
//         let table;
//         switch (input.item_table_name) {
//           case "zero_days":
//             table = zeroDayTable;
//             break;
//           case "zero_day_samples":
//             table = zeroDaySampleTable;
//             break;
//           case "tph":
//             table = tphTable;
//             break;
//           case "oil_zappers":
//             table = oilZapperTable;
//             break;
//           case "clean_up_oil_spill":
//             table = cleanUpOilSpillTable;
//             break;
//           case "lifting_oil_slush":
//             table = liftingOilSlushTable;
//             break;
//           case "excavation_cont_soil":
//             table = excavationContSoilTable;
//             break;
//           case "trnsprt_oil_slush":
//             table = trnsprtOilSlushTable;
//             break;
//         }

//         if (table) {
//           await ctx.db
//             .update(table)
//             .set({ site_activity_id: null })
//             .where(eq(table.id, input.item_id));
//         }

//         // Remove the link from site_activity_items
//         await ctx.db
//           .delete(siteActivityItemsTable)
//           .where(
//             and(
//               eq(
//                 siteActivityItemsTable.site_activity_id,
//                 input.site_activity_id
//               ),
//               eq(siteActivityItemsTable.item_table_name, input.item_table_name),
//               eq(siteActivityItemsTable.item_id, input.item_id)
//             )
//           );

//         return { success: true };
//       })
//     ),

//   // ============== Individual Item Type Mutations ==============

//   // Zero Day Activity Mutations
//   createZeroDayActivity: operatorProcedure
//     .input(createZeroDayActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const [activity] = await ctx.db.insert(zeroDayTable).values({
//           work_order_site_id: input.work_order_site_id,
//           site_activity_id: input.site_activity_id,
//           type: input.type || "work_estimate",
//           amount: input.amount?.toString(),
//           length_metric: input.length_metric?.toString(),
//           width_metric: input.width_metric?.toString(),
//           depth_metric: input.depth_metric?.toString(),
//           volume_informed: input.volume_informed?.toString(),
//           document_key: input.document_key || "",
//         });

//         return { success: true, id: Number(activity.insertId) };
//       })
//     ),

//   updateZeroDayActivity: operatorProcedure
//     .input(updateZeroDayActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const { id, ...updateData } = input;

//         const dataToUpdate: any = {};
//         if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
//         if (updateData.amount !== undefined)
//           dataToUpdate.amount = updateData.amount?.toString();
//         if (updateData.length_metric !== undefined)
//           dataToUpdate.length_metric = updateData.length_metric?.toString();
//         if (updateData.width_metric !== undefined)
//           dataToUpdate.width_metric = updateData.width_metric?.toString();
//         if (updateData.depth_metric !== undefined)
//           dataToUpdate.depth_metric = updateData.depth_metric?.toString();
//         if (updateData.volume_informed !== undefined)
//           dataToUpdate.volume_informed = updateData.volume_informed?.toString();
//         if (updateData.document_key !== undefined)
//           dataToUpdate.document_key = updateData.document_key;

//         await ctx.db
//           .update(zeroDayTable)
//           .set(dataToUpdate)
//           .where(eq(zeroDayTable.id, id));

//         return { success: true };
//       })
//     ),

//   deleteZeroDayActivity: operatorProcedure.input(deleteActivitySchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       // Also remove from site_activity_items if linked
//       await ctx.db
//         .delete(siteActivityItemsTable)
//         .where(
//           and(
//             eq(siteActivityItemsTable.item_table_name, "zero_days"),
//             eq(siteActivityItemsTable.item_id, input.id)
//           )
//         );

//       await ctx.db.delete(zeroDayTable).where(eq(zeroDayTable.id, input.id));

//       return { success: true };
//     })
//   ),

//   // Zero Day Sample Mutations
//   createZeroDaySample: operatorProcedure
//     .input(createZeroDaySampleSchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const [sample] = await ctx.db.insert(zeroDaySampleTable).values({
//           work_order_site_id: input.work_order_site_id,
//           site_activity_id: input.site_activity_id,
//           activity_description: input.activity_description,
//           status: input.status,
//           type: input.type || "work_estimate",
//           amount: input.amount?.toString(),
//           length: input.length?.toString(),
//           width: input.width?.toString(),
//           height: input.height?.toString(),
//           volume_a1: input.volume_a1?.toString(),
//           density_a2: input.density_a2?.toString(),
//           result_a: input.result_a?.toString(),
//           document_key: input.document_key || "",
//         });

//         return { success: true, id: Number(sample.insertId) };
//       })
//     ),

//   updateZeroDaySample: operatorProcedure
//     .input(updateZeroDaySampleSchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const { id, ...updateData } = input;

//         const dataToUpdate: any = {};
//         if (updateData.activity_description !== undefined)
//           dataToUpdate.activity_description = updateData.activity_description;
//         if (updateData.status !== undefined)
//           dataToUpdate.status = updateData.status;
//         if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
//         if (updateData.amount !== undefined)
//           dataToUpdate.amount = updateData.amount?.toString();
//         if (updateData.length !== undefined)
//           dataToUpdate.length = updateData.length?.toString();
//         if (updateData.width !== undefined)
//           dataToUpdate.width = updateData.width?.toString();
//         if (updateData.height !== undefined)
//           dataToUpdate.height = updateData.height?.toString();
//         if (updateData.volume_a1 !== undefined)
//           dataToUpdate.volume_a1 = updateData.volume_a1?.toString();
//         if (updateData.density_a2 !== undefined)
//           dataToUpdate.density_a2 = updateData.density_a2?.toString();
//         if (updateData.result_a !== undefined)
//           dataToUpdate.result_a = updateData.result_a?.toString();
//         if (updateData.document_key !== undefined)
//           dataToUpdate.document_key = updateData.document_key;

//         await ctx.db
//           .update(zeroDaySampleTable)
//           .set(dataToUpdate)
//           .where(eq(zeroDaySampleTable.id, id));

//         return { success: true };
//       })
//     ),

//   deleteZeroDaySample: operatorProcedure.input(deleteActivitySchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       await ctx.db
//         .delete(siteActivityItemsTable)
//         .where(
//           and(
//             eq(siteActivityItemsTable.item_table_name, "zero_day_samples"),
//             eq(siteActivityItemsTable.item_id, input.id)
//           )
//         );

//       await ctx.db
//         .delete(zeroDaySampleTable)
//         .where(eq(zeroDaySampleTable.id, input.id));

//       return { success: true };
//     })
//   ),

//   // TPH Activity Mutations
//   createTphActivity: operatorProcedure.input(createTphActivitySchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       const [activity] = await ctx.db.insert(tphTable).values({
//         work_order_site_id: input.work_order_site_id,
//         site_activity_id: input.site_activity_id,
//         activity_description: input.activity_description,
//         sample_collection_date: new Date(input.sample_collection_date),
//         sample_send_date: new Date(input.sample_send_date),
//         sample_report_received: input.sample_report_received,
//         type: input.type || "work_estimate",
//         amount: input.amount?.toString(),
//         document_key: input.document_key || "",
//         tph_value: input.tph_value?.toString(),
//         lab_info: input.lab_info,
//       });

//       return { success: true, id: Number(activity.insertId) };
//     })
//   ),

//   updateTphActivity: operatorProcedure.input(updateTphActivitySchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       const { id, ...updateData } = input;

//       const dataToUpdate: any = {};
//       if (updateData.activity_description !== undefined)
//         dataToUpdate.activity_description = updateData.activity_description;
//       if (updateData.sample_collection_date !== undefined) {
//         dataToUpdate.sample_collection_date = new Date(
//           updateData.sample_collection_date
//         );
//       }
//       if (updateData.sample_send_date !== undefined) {
//         dataToUpdate.sample_send_date = new Date(updateData.sample_send_date);
//       }
//       if (updateData.sample_report_received !== undefined)
//         dataToUpdate.sample_report_received = updateData.sample_report_received;
//       if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
//       if (updateData.amount !== undefined)
//         dataToUpdate.amount = updateData.amount?.toString();
//       if (updateData.document_key !== undefined)
//         dataToUpdate.document_key = updateData.document_key;
//       if (updateData.tph_value !== undefined)
//         dataToUpdate.tph_value = updateData.tph_value?.toString();
//       if (updateData.lab_info !== undefined)
//         dataToUpdate.lab_info = updateData.lab_info;

//       await ctx.db
//         .update(tphTable)
//         .set(dataToUpdate)
//         .where(eq(tphTable.id, id));

//       return { success: true };
//     })
//   ),

//   deleteTphActivity: operatorProcedure.input(deleteActivitySchema).mutation(
//     handleMutation(async ({ input, ctx }) => {
//       await ctx.db
//         .delete(siteActivityItemsTable)
//         .where(
//           and(
//             eq(siteActivityItemsTable.item_table_name, "tph"),
//             eq(siteActivityItemsTable.item_id, input.id)
//           )
//         );

//       await ctx.db.delete(tphTable).where(eq(tphTable.id, input.id));

//       return { success: true };
//     })
//   ),

//   // Oil Zapper Activity Mutations
//   createOilZapperActivity: operatorProcedure
//     .input(createOilZapperActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const [activity] = await ctx.db.insert(oilZapperTable).values({
//           work_order_site_id: input.work_order_site_id,
//           site_activity_id: input.site_activity_id,
//           activity_description: input.activity_description,
//           type: input.type || "work_estimate",
//           amount: input.amount?.toString(),
//           length: input.length?.toString(),
//           width: input.width?.toString(),
//           depth: input.depth?.toString(),
//           document_key: input.document_key || "",
//         });

//         return { success: true, id: Number(activity.insertId) };
//       })
//     ),

//   updateOilZapperActivity: operatorProcedure
//     .input(updateOilZapperActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         const { id, ...updateData } = input;

//         const dataToUpdate: any = {};
//         if (updateData.activity_description !== undefined)
//           dataToUpdate.activity_description = updateData.activity_description;
//         if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
//         if (updateData.amount !== undefined)
//           dataToUpdate.amount = updateData.amount?.toString();
//         if (updateData.length !== undefined)
//           dataToUpdate.length = updateData.length?.toString();
//         if (updateData.width !== undefined)
//           dataToUpdate.width = updateData.width?.toString();
//         if (updateData.depth !== undefined)
//           dataToUpdate.depth = updateData.depth?.toString();
//         if (updateData.document_key !== undefined)
//           dataToUpdate.document_key = updateData.document_key;

//         await ctx.db
//           .update(oilZapperTable)
//           .set(dataToUpdate)
//           .where(eq(oilZapperTable.id, id));

//         return { success: true };
//       })
//     ),

//   deleteOilZapperActivity: operatorProcedure
//     .input(deleteActivitySchema)
//     .mutation(
//       handleMutation(async ({ input, ctx }) => {
//         await ctx.db
//           .delete(siteActivityItemsTable)
//           .where(
//             and(
//               eq(siteActivityItemsTable.item_table_name, "oil_zappers"),
//               eq(siteActivityItemsTable.item_id, input.id)
//             )
//           );

//         await ctx.db
//           .delete(oilZapperTable)
//           .where(eq(oilZapperTable.id, input.id));

//         return { success: true };
//       })
//     ),
// });
