import { router, publicProcedure } from "@/trpc";
import {
  addActivitySchema,
  editActivitySchma,
  addSiteActivitySchema,
  zeroDayActivityDataSchema,
  zeroDaySampleDataSchema,
  tphActivityDataSchema,
  oilZapperActivityDataSchema,
  updateZeroDayActivityDataSchema,
  updateZeroDaySampleDataSchema,
  updateTphActivityDataSchema,
  updateOilZapperActivityDataSchema,
} from "./activity.schema";

import { toLowerAndTrim } from "@/utils/sanitize-string";
import { db } from "@/db";
import {
  activityTable,
  siteActivityTable,
  zeroDayActivityTable,
  zeroDaySampleTable,
  tphActivityTable,
  oilZapperActivityTable,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const activityMutationRouter = router({
  addActivity: publicProcedure
    .input(addActivitySchema)
    .mutation(async ({ input }) => {
      const name = toLowerAndTrim(input.name);
      const description = toLowerAndTrim(input.description);

      try {
        await db.insert(activityTable).values({
          name,
          description,
          activity_type: input.activity_type,
          activity_sub_type: input.activity_sub_type || null,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add activity",
        });
      }

      return { success: true };
    }),

  editActivity: publicProcedure
    .input(editActivitySchma)
    .mutation(async ({ input }) => {
      try {
        const existingActivity = await db
          .select()
          .from(activityTable)
          .where(eq(activityTable.id, input.id));

        if (existingActivity.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No existing activity present",
          });
        }

        const updateData: any = {
          description: input.description,
        };

        if (input.activity_type) {
          updateData.activity_type = input.activity_type;
        }

        if (input.activity_sub_type) {
          updateData.activity_sub_type = input.activity_sub_type;
        }

        await db
          .update(activityTable)
          .set(updateData)
          .where(eq(activityTable.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit activity",
        });
      }
    }),

  // Add activity to a work order site
  addSiteActivity: publicProcedure
    .input(addSiteActivitySchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db.insert(siteActivityTable).values({
          wo_site_id: input.wo_site_id,
          activity_id: input.activity_id,
          activity_description: input.activity_description || null,
          start_date: input.start_date ? new Date(input.start_date) : null,
          end_date: input.end_date ? new Date(input.end_date) : null,
          status: input.status,
        });

        return {
          success: true,
          siteActivityId: result[0].insertId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add site activity",
        });
      }
    }),

  // Add 0 Day Activity specific data
  addZeroDayActivityData: publicProcedure
    .input(zeroDayActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        await db.insert(zeroDayActivityTable).values({
          site_activity_id: input.site_activity_id,
          length_metric: input.length_metric?.toString() || null,
          width_metric: input.width_metric?.toString() || null,
          depth_metric: input.depth_metric?.toString() || null,
          volume_informed: input.volume_informed?.toString() || null,
          document_url: input.document_url || null,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add 0 day activity data",
        });
      }
    }),

  // Add 0 Day Sample specific data
  addZeroDaySampleData: publicProcedure
    .input(zeroDaySampleDataSchema)
    .mutation(async ({ input }) => {
      try {
        await db.insert(zeroDaySampleTable).values({
          site_activity_id: input.site_activity_id,
          length: input.length?.toString() || null,
          width: input.width?.toString() || null,
          height: input.height?.toString() || null,
          volume_m3: input.volume_m3?.toString() || null,
          density: input.density?.toString() || null,
          final_value: input.final_value?.toString() || null,
          document_url: input.document_url || null,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add 0 day sample data",
        });
      }
    }),

  // Add TPH Activity specific data
  addTphActivityData: publicProcedure
    .input(tphActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        await db.insert(tphActivityTable).values({
          site_activity_id: input.site_activity_id,
          sample_collection_date: input.sample_collection_date
            ? new Date(input.sample_collection_date)
            : null,
          sample_send_date: input.sample_send_date
            ? new Date(input.sample_send_date)
            : null,
          sample_report_received_date: input.sample_report_received_date
            ? new Date(input.sample_report_received_date)
            : null,
          tph_value: input.tph_value?.toString() || null,
          lab_name: input.lab_name || null,
          lab_contact: input.lab_contact || null,
          lab_address: input.lab_address || null,
          report_document_url: input.report_document_url || null,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add TPH activity data",
        });
      }
    }),

  // Add Oil Zapper Activity specific data
  addOilZapperActivityData: publicProcedure
    .input(oilZapperActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        await db.insert(oilZapperActivityTable).values({
          site_activity_id: input.site_activity_id,
          first_intimation_date: input.first_intimation_date
            ? new Date(input.first_intimation_date)
            : null,
          first_intimation_raised: input.first_intimation_raised,
          intimation_document_url: input.intimation_document_url || null,
          activity_completed_date: input.activity_completed_date
            ? new Date(input.activity_completed_date)
            : null,
          completion_notes: input.completion_notes || null,
          completion_document_url: input.completion_document_url || null,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add oil zapper activity data",
        });
      }
    }),

  // Update 0 Day Activity data
  updateZeroDayActivityData: publicProcedure
    .input(updateZeroDayActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        const dataToUpdate: any = {};
        if (updateData.length_metric !== undefined)
          dataToUpdate.length_metric = updateData.length_metric.toString();
        if (updateData.width_metric !== undefined)
          dataToUpdate.width_metric = updateData.width_metric.toString();
        if (updateData.depth_metric !== undefined)
          dataToUpdate.depth_metric = updateData.depth_metric.toString();
        if (updateData.volume_informed !== undefined)
          dataToUpdate.volume_informed = updateData.volume_informed.toString();
        if (updateData.document_url !== undefined)
          dataToUpdate.document_url = updateData.document_url;

        await db
          .update(zeroDayActivityTable)
          .set(dataToUpdate)
          .where(eq(zeroDayActivityTable.id, id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update 0 day activity data",
        });
      }
    }),

  // Update 0 Day Sample data
  updateZeroDaySampleData: publicProcedure
    .input(updateZeroDaySampleDataSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        const dataToUpdate: any = {};
        if (updateData.length !== undefined)
          dataToUpdate.length = updateData.length.toString();
        if (updateData.width !== undefined)
          dataToUpdate.width = updateData.width.toString();
        if (updateData.height !== undefined)
          dataToUpdate.height = updateData.height.toString();
        if (updateData.volume_m3 !== undefined)
          dataToUpdate.volume_m3 = updateData.volume_m3.toString();
        if (updateData.density !== undefined)
          dataToUpdate.density = updateData.density.toString();
        if (updateData.final_value !== undefined)
          dataToUpdate.final_value = updateData.final_value.toString();
        if (updateData.document_url !== undefined)
          dataToUpdate.document_url = updateData.document_url;

        await db
          .update(zeroDaySampleTable)
          .set(dataToUpdate)
          .where(eq(zeroDaySampleTable.id, id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update 0 day sample data",
        });
      }
    }),

  // Update TPH Activity data
  updateTphActivityData: publicProcedure
    .input(updateTphActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        const dataToUpdate: any = {};
        if (updateData.sample_collection_date)
          dataToUpdate.sample_collection_date = new Date(
            updateData.sample_collection_date
          );
        if (updateData.sample_send_date)
          dataToUpdate.sample_send_date = new Date(updateData.sample_send_date);
        if (updateData.sample_report_received_date)
          dataToUpdate.sample_report_received_date = new Date(
            updateData.sample_report_received_date
          );
        if (updateData.tph_value !== undefined)
          dataToUpdate.tph_value = updateData.tph_value.toString();
        if (updateData.lab_name !== undefined)
          dataToUpdate.lab_name = updateData.lab_name;
        if (updateData.lab_contact !== undefined)
          dataToUpdate.lab_contact = updateData.lab_contact;
        if (updateData.lab_address !== undefined)
          dataToUpdate.lab_address = updateData.lab_address;
        if (updateData.report_document_url !== undefined)
          dataToUpdate.report_document_url = updateData.report_document_url;

        await db
          .update(tphActivityTable)
          .set(dataToUpdate)
          .where(eq(tphActivityTable.id, id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update TPH activity data",
        });
      }
    }),

  // Update Oil Zapper Activity data
  updateOilZapperActivityData: publicProcedure
    .input(updateOilZapperActivityDataSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        const dataToUpdate: any = {};
        if (updateData.first_intimation_date)
          dataToUpdate.first_intimation_date = new Date(
            updateData.first_intimation_date
          );
        if (updateData.first_intimation_raised !== undefined)
          dataToUpdate.first_intimation_raised =
            updateData.first_intimation_raised;
        if (updateData.intimation_document_url !== undefined)
          dataToUpdate.intimation_document_url =
            updateData.intimation_document_url;
        if (updateData.activity_completed_date)
          dataToUpdate.activity_completed_date = new Date(
            updateData.activity_completed_date
          );
        if (updateData.completion_notes !== undefined)
          dataToUpdate.completion_notes = updateData.completion_notes;
        if (updateData.completion_document_url !== undefined)
          dataToUpdate.completion_document_url =
            updateData.completion_document_url;

        await db
          .update(oilZapperActivityTable)
          .set(dataToUpdate)
          .where(eq(oilZapperActivityTable.id, id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update oil zapper activity data",
        });
      }
    }),
});
