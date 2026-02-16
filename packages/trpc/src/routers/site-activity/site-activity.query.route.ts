// import { eq, and } from "drizzle-orm";
// import { schema } from "@pkg/db";
// import { publicProcedure } from "../../core";
// import { router } from "../../trpc";
// import { handleQuery } from "../../helper/typed-handler";
// import {
//   getActivitiesSchema,
//   getActivityByIdSchema,
//   getSiteActivitiesSchema,
//   getSiteActivityByIdSchema,
//   getActivityItemsSchema,
//   activityPhaseEnum,
// } from "./site-activity.schema";
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

// export const siteActivityQueryRouter = router({
//   // ============== Site Activity Queries ==============

//   // Get all site activities for a work order site
//   getSiteActivities: publicProcedure.input(getSiteActivitiesSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activities = await ctx.db
//         .select()
//         .from(siteActivityTable)
//         .where(
//           eq(siteActivityTable.work_order_site_id, input.work_order_site_id)
//         )
//         .orderBy(siteActivityTable.created_at);

//       return activities;
//     })
//   ),

//   // Get a single site activity by ID
//   getSiteActivityById: publicProcedure.input(getSiteActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activity = await ctx.db
//         .select()
//         .from(siteActivityTable)
//         .where(eq(siteActivityTable.id, input.id))
//         .limit(1);

//       return activity[0] || null;
//     })
//   ),

//   // Get activity items for a site activity
//   getActivityItems: publicProcedure.input(getActivityItemsSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const items = await ctx.db
//         .select()
//         .from(siteActivityItemsTable)
//         .where(
//           eq(siteActivityItemsTable.site_activity_id, input.site_activity_id)
//         )
//         .orderBy(siteActivityItemsTable.created_at);

//       return items;
//     })
//   ),

//   // Get selected item types for a site activity (placeholders with item_id = 0)
//   getSelectedItemTypes: publicProcedure.input(getSiteActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const items = await ctx.db
//         .select({
//           item_table_name: siteActivityItemsTable.item_table_name,
//         })
//         .from(siteActivityItemsTable)
//         .where(
//           and(
//             eq(siteActivityItemsTable.site_activity_id, input.id),
//             eq(siteActivityItemsTable.item_id, 0)
//           )
//         );

//       return items.map(
//         (item: { item_table_name: string }) => item.item_table_name
//       );
//     })
//   ),

//   // Get items grouped by item type and phase for a site activity
//   getItemsByTypeAndPhase: publicProcedure
//     .input(getSiteActivityByIdSchema)
//     .query(
//       handleQuery(async ({ input, ctx }) => {
//         // Get all items for this site activity
//         const itemLinks = await ctx.db
//           .select()
//           .from(siteActivityItemsTable)
//           .where(eq(siteActivityItemsTable.site_activity_id, input.id));

//         // Filter out placeholders (item_id = 0)
//         const actualItems = itemLinks.filter(
//           (item: { item_id: number }) => item.item_id !== 0
//         );

//         // Group by item_table_name
//         const result: Record<
//           string,
//           {
//             work_estimate: any[];
//             order: any[];
//             expense: any[];
//           }
//         > = {};

//         // Table mapping
//         const tableMap: Record<string, any> = {
//           zero_days: zeroDayTable,
//           zero_day_samples: zeroDaySampleTable,
//           tph: tphTable,
//           oil_zappers: oilZapperTable,
//           clean_up_oil_spill: cleanUpOilSpillTable,
//           lifting_oil_slush: liftingOilSlushTable,
//           excav_cont_soil: excavationContSoilTable,
//           trnsprt_oil_slush: trnsprtOilSlushTable,
//         };

//         for (const item of actualItems) {
//           const tableName = item.item_table_name;
//           const table = tableMap[tableName];

//           if (!table) continue;

//           // Initialize if not exists
//           if (!result[tableName]) {
//             result[tableName] = {
//               work_estimate: [],
//               order: [],
//               expense: [],
//             };
//           }

//           // Fetch the actual item data
//           const rows = await ctx.db
//             .select()
//             .from(table)
//             .where(eq(table.id, item.item_id))
//             .limit(1);

//           const data = rows[0];
//           if (data && data.type) {
//             const phaseKey = data.type as "work_estimate" | "order" | "expense";
//             if (result[tableName][phaseKey]) {
//               result[tableName][phaseKey].push({
//                 id: data.id,
//                 item_link_id: item.id,
//                 ...data,
//               });
//             }
//           }
//         }

//         return result;
//       })
//     ),

//   // Get activity items with their data based on phase
//   getActivityItemsWithData: publicProcedure
//     .input(
//       z.object({
//         site_activity_id: z.number().positive(),
//         phase: activityPhaseEnum.optional(),
//       })
//     )
//     .query(
//       handleQuery(async ({ input, ctx }) => {
//         // Get all items for this activity
//         const items = await ctx.db
//           .select()
//           .from(siteActivityItemsTable)
//           .where(
//             eq(siteActivityItemsTable.site_activity_id, input.site_activity_id)
//           );

//         // Fetch data from each table based on item type
//         const result: {
//           table_name: string;
//           item_id: number;
//           data: any;
//           phase: string;
//         }[] = [];

//         for (const item of items) {
//           let data = null;
//           let table;

//           switch (item.item_table_name) {
//             case "zero_days":
//               table = zeroDayTable;
//               break;
//             case "zero_day_samples":
//               table = zeroDaySampleTable;
//               break;
//             case "tph":
//               table = tphTable;
//               break;
//             case "oil_zappers":
//               table = oilZapperTable;
//               break;
//             case "clean_up_oil_spill":
//               table = cleanUpOilSpillTable;
//               break;
//             case "lifting_oil_slush":
//               table = liftingOilSlushTable;
//               break;
//             case "excav_cont_soil":
//               table = excavationContSoilTable;
//               break;
//             case "trnsprt_oil_slush":
//               table = trnsprtOilSlushTable;
//               break;
//           }

//           if (table) {
//             const rows = await ctx.db
//               .select()
//               .from(table)
//               .where(eq(table.id, item.item_id))
//               .limit(1);

//             data = rows[0] || null;
//           }

//           if (data) {
//             // Filter by phase if specified
//             if (!input.phase || data.type === input.phase) {
//               result.push({
//                 table_name: item.item_table_name,
//                 item_id: item.item_id,
//                 data,
//                 phase: data.type,
//               });
//             }
//           }
//         }

//         return result;
//       })
//     ),

//   // Get items grouped by phase for a site activity
//   getItemsByPhase: publicProcedure.input(getSiteActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const items = await ctx.db
//         .select()
//         .from(siteActivityItemsTable)
//         .where(eq(siteActivityItemsTable.site_activity_id, input.id));

//       const phases: {
//         work_estimate: any[];
//         order: any[];
//         expense: any[];
//       } = {
//         work_estimate: [],
//         order: [],
//         expense: [],
//       };

//       for (const item of items) {
//         let table;
//         switch (item.item_table_name) {
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
//           case "excav_cont_soil":
//             table = excavationContSoilTable;
//             break;
//           case "trnsprt_oil_slush":
//             table = trnsprtOilSlushTable;
//             break;
//         }

//         if (table) {
//           const rows = await ctx.db
//             .select()
//             .from(table)
//             .where(eq(table.id, item.item_id))
//             .limit(1);

//           const data = rows[0];
//           if (data && data.type) {
//             const itemData = {
//               table_name: item.item_table_name,
//               item_id: item.item_id,
//               ...data,
//             };

//             if (data.type === "work_estimate") {
//               phases.work_estimate.push(itemData);
//             } else if (data.type === "order") {
//               phases.order.push(itemData);
//             } else if (data.type === "expense") {
//               phases.expense.push(itemData);
//             }
//           }
//         }
//       }

//       return phases;
//     })
//   ),

//   // ============== Individual Item Type Queries ==============

//   // Zero Day Activity Queries
//   getZeroDayActivity: publicProcedure.input(getActivitiesSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activity = await ctx.db
//         .select()
//         .from(zeroDayTable)
//         .where(eq(zeroDayTable.work_order_site_id, input.work_order_site_id))
//         .limit(1);

//       return activity[0] || null;
//     })
//   ),

//   getZeroDayActivityById: publicProcedure.input(getActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activity = await ctx.db
//         .select()
//         .from(zeroDayTable)
//         .where(eq(zeroDayTable.id, input.id))
//         .limit(1);

//       return activity[0] || null;
//     })
//   ),

//   // Zero Day Sample Queries
//   getZeroDaySample: publicProcedure.input(getActivitiesSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const sample = await ctx.db
//         .select()
//         .from(zeroDaySampleTable)
//         .where(
//           eq(zeroDaySampleTable.work_order_site_id, input.work_order_site_id)
//         )
//         .limit(1);

//       return sample[0] || null;
//     })
//   ),

//   getZeroDaySampleById: publicProcedure.input(getActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const sample = await ctx.db
//         .select()
//         .from(zeroDaySampleTable)
//         .where(eq(zeroDaySampleTable.id, input.id))
//         .limit(1);

//       return sample[0] || null;
//     })
//   ),

//   // TPH Activity Queries
//   getTphActivities: publicProcedure.input(getActivitiesSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activities = await ctx.db
//         .select()
//         .from(tphTable)
//         .where(eq(tphTable.work_order_site_id, input.work_order_site_id))
//         .orderBy(tphTable.created_at);

//       return activities;
//     })
//   ),

//   getTphActivityById: publicProcedure.input(getActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activity = await ctx.db
//         .select()
//         .from(tphTable)
//         .where(eq(tphTable.id, input.id))
//         .limit(1);

//       return activity[0] || null;
//     })
//   ),

//   // Oil Zapper Activity Queries
//   getOilZapperActivities: publicProcedure.input(getActivitiesSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activities = await ctx.db
//         .select()
//         .from(oilZapperTable)
//         .where(eq(oilZapperTable.work_order_site_id, input.work_order_site_id))
//         .orderBy(oilZapperTable.created_at);

//       return activities;
//     })
//   ),

//   getOilZapperActivityById: publicProcedure.input(getActivityByIdSchema).query(
//     handleQuery(async ({ input, ctx }) => {
//       const activity = await ctx.db
//         .select()
//         .from(oilZapperTable)
//         .where(eq(oilZapperTable.id, input.id))
//         .limit(1);

//       return activity[0] || null;
//     })
//   ),

//   // Clean Up Oil Spill Queries
//   getCleanUpOilSpillActivities: publicProcedure
//     .input(getActivitiesSchema)
//     .query(
//       handleQuery(async ({ input, ctx }) => {
//         const activities = await ctx.db
//           .select()
//           .from(cleanUpOilSpillTable)
//           .where(
//             eq(
//               cleanUpOilSpillTable.work_order_site_id,
//               input.work_order_site_id
//             )
//           )
//           .orderBy(cleanUpOilSpillTable.created_at);

//         return activities;
//       })
//     ),

//   // Lifting Oil Slush Queries
//   getLiftingOilSlushActivities: publicProcedure
//     .input(getActivitiesSchema)
//     .query(
//       handleQuery(async ({ input, ctx }) => {
//         const activities = await ctx.db
//           .select()
//           .from(liftingOilSlushTable)
//           .where(
//             eq(
//               liftingOilSlushTable.work_order_site_id,
//               input.work_order_site_id
//             )
//           )
//           .orderBy(liftingOilSlushTable.created_at);

//         return activities;
//       })
//     ),

//   // Excavation Contaminated Soil Queries
//   getExcavationContSoilActivities: publicProcedure
//     .input(getActivitiesSchema)
//     .query(
//       handleQuery(async ({ input, ctx }) => {
//         const activities = await ctx.db
//           .select()
//           .from(excavationContSoilTable)
//           .where(
//             eq(
//               excavationContSoilTable.work_order_site_id,
//               input.work_order_site_id
//             )
//           )
//           .orderBy(excavationContSoilTable.created_at);

//         return activities;
//       })
//     ),

//   // Transport Oil Slush Queries
//   getTrnsprtOilSlushActivities: publicProcedure
//     .input(getActivitiesSchema)
//     .query(
//       handleQuery(async ({ input, ctx }) => {
//         const activities = await ctx.db
//           .select()
//           .from(trnsprtOilSlushTable)
//           .where(
//             eq(
//               trnsprtOilSlushTable.work_order_site_id,
//               input.work_order_site_id
//             )
//           )
//           .orderBy(trnsprtOilSlushTable.created_at);

//         return activities;
//       })
//     ),
// });
