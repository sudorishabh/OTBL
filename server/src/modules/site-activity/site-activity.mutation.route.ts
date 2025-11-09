import { publicProcedure } from "../../trpc";
import {
  createZeroDayActivitySchema,
  updateZeroDayActivitySchema,
  createZeroDaySampleSchema,
  updateZeroDaySampleSchema,
  createTphActivitySchema,
  updateTphActivitySchema,
  createOilZapperActivitySchema,
  updateOilZapperActivitySchema,
  createOilZapperIndentSchema,
  updateOilZapperIndentSchema,
  deleteActivitySchema,
} from "./site-activity.schema";
import { db } from "../../db";
import {
  zeroDayActivityTable,
  zeroDaySampleTable,
  tphActivityTable,
  oilZapperActivityTable,
  oilZapperIndentTable,
} from "../../db/schema";
import { eq } from "drizzle-orm";

// Zero Day Activity Mutations
export const createZeroDayActivity = publicProcedure
  .input(createZeroDayActivitySchema)
  .mutation(async ({ input }) => {
    const [activity] = await db.insert(zeroDayActivityTable).values({
      work_order_site_id: input.work_order_site_id,
      activity_description: input.activity_description,
      start_date: new Date(input.start_date),
      end_date: new Date(input.end_date),
      length_metric: input.length_metric?.toString(),
      width_metric: input.width_metric?.toString(),
      depth_metric: input.depth_metric?.toString(),
      volume_informed: input.volume_informed?.toString(),
      document_url: input.document_url,
    });

    return { success: true, id: activity.insertId };
  });

export const updateZeroDayActivity = publicProcedure
  .input(updateZeroDayActivitySchema)
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const dataToUpdate: any = { ...updateData };
    if (updateData.start_date) {
      dataToUpdate.start_date = new Date(updateData.start_date);
    }
    if (updateData.end_date) {
      dataToUpdate.end_date = new Date(updateData.end_date);
    }

    await db
      .update(zeroDayActivityTable)
      .set(dataToUpdate)
      .where(eq(zeroDayActivityTable.id, id));

    return { success: true };
  });

export const deleteZeroDayActivity = publicProcedure
  .input(deleteActivitySchema)
  .mutation(async ({ input }) => {
    await db
      .delete(zeroDayActivityTable)
      .where(eq(zeroDayActivityTable.id, input.id));

    return { success: true };
  });

// Zero Day Sample Mutations
export const createZeroDaySample = publicProcedure
  .input(createZeroDaySampleSchema)
  .mutation(async ({ input }) => {
    const [sample] = await db.insert(zeroDaySampleTable).values({
      work_order_site_id: input.work_order_site_id,
      activity_description: input.activity_description,
      start_date: new Date(input.start_date),
      end_date: new Date(input.end_date),
      status: input.status,
      length: input.length?.toString(),
      width: input.width?.toString(),
      height: input.height?.toString(),
      volume_a1: input.volume_a1?.toString(),
      density_a2: input.density_a2?.toString(),
      result_a: input.result_a?.toString(),
    });

    return { success: true, id: sample.insertId };
  });

export const updateZeroDaySample = publicProcedure
  .input(updateZeroDaySampleSchema)
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const dataToUpdate: any = { ...updateData };
    if (updateData.start_date) {
      dataToUpdate.start_date = new Date(updateData.start_date);
    }
    if (updateData.end_date) {
      dataToUpdate.end_date = new Date(updateData.end_date);
    }

    await db
      .update(zeroDaySampleTable)
      .set(dataToUpdate)
      .where(eq(zeroDaySampleTable.id, id));

    return { success: true };
  });

export const deleteZeroDaySample = publicProcedure
  .input(deleteActivitySchema)
  .mutation(async ({ input }) => {
    await db
      .delete(zeroDaySampleTable)
      .where(eq(zeroDaySampleTable.id, input.id));

    return { success: true };
  });

// TPH Activity Mutations
export const createTphActivity = publicProcedure
  .input(createTphActivitySchema)
  .mutation(async ({ input }) => {
    const [activity] = await db.insert(tphActivityTable).values({
      work_order_site_id: input.work_order_site_id,
      activity_description: input.activity_description,
      sample_collection_date: new Date(input.sample_collection_date),
      sample_send_date: new Date(input.sample_send_date),
      sample_report_received: input.sample_report_received,
      report_document_url: input.report_document_url,
      tph_value: input.tph_value?.toString(),
      lab_info: input.lab_info,
    });

    return { success: true, id: activity.insertId };
  });

export const updateTphActivity = publicProcedure
  .input(updateTphActivitySchema)
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const dataToUpdate: any = { ...updateData };
    if (updateData.sample_collection_date) {
      dataToUpdate.sample_collection_date = new Date(
        updateData.sample_collection_date
      );
    }
    if (updateData.sample_send_date) {
      dataToUpdate.sample_send_date = new Date(updateData.sample_send_date);
    }

    await db
      .update(tphActivityTable)
      .set(dataToUpdate)
      .where(eq(tphActivityTable.id, id));

    return { success: true };
  });

export const deleteTphActivity = publicProcedure
  .input(deleteActivitySchema)
  .mutation(async ({ input }) => {
    await db.delete(tphActivityTable).where(eq(tphActivityTable.id, input.id));

    return { success: true };
  });

// Oil Zapper Activity Mutations
export const createOilZapperActivity = publicProcedure
  .input(createOilZapperActivitySchema)
  .mutation(async ({ input }) => {
    const dataToInsert: any = { ...input };
    if (input.sent_date) {
      dataToInsert.sent_date = new Date(input.sent_date);
    }

    const [activity] = await db
      .insert(oilZapperActivityTable)
      .values(dataToInsert);

    return { success: true, id: activity.insertId };
  });

export const updateOilZapperActivity = publicProcedure
  .input(updateOilZapperActivitySchema)
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const dataToUpdate: any = { ...updateData };
    if (updateData.sent_date) {
      dataToUpdate.sent_date = new Date(updateData.sent_date);
    }

    await db
      .update(oilZapperActivityTable)
      .set(dataToUpdate)
      .where(eq(oilZapperActivityTable.id, id));

    return { success: true };
  });

export const deleteOilZapperActivity = publicProcedure
  .input(deleteActivitySchema)
  .mutation(async ({ input }) => {
    await db
      .delete(oilZapperActivityTable)
      .where(eq(oilZapperActivityTable.id, input.id));

    return { success: true };
  });

// Oil Zapper Indent Mutations
export const createOilZapperIndent = publicProcedure
  .input(createOilZapperIndentSchema)
  .mutation(async ({ input }) => {
    const [indent] = await db.insert(oilZapperIndentTable).values({
      oil_zapper_activity_id: input.oil_zapper_activity_id,
      description: input.description,
      date: new Date(input.date),
      kg: input.kg?.toString(),
      proposed_amount: input.proposed_amount?.toString(),
    });

    return { success: true, id: indent.insertId };
  });

export const updateOilZapperIndent = publicProcedure
  .input(updateOilZapperIndentSchema)
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const dataToUpdate: any = { ...updateData };
    if (updateData.date) {
      dataToUpdate.date = new Date(updateData.date);
    }

    await db
      .update(oilZapperIndentTable)
      .set(dataToUpdate)
      .where(eq(oilZapperIndentTable.id, id));

    return { success: true };
  });

export const deleteOilZapperIndent = publicProcedure
  .input(deleteActivitySchema)
  .mutation(async ({ input }) => {
    await db
      .delete(oilZapperIndentTable)
      .where(eq(oilZapperIndentTable.id, input.id));

    return { success: true };
  });
