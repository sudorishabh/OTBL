import { publicProcedure } from "../../trpc";
import {
  getActivitiesSchema,
  getActivityByIdSchema,
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

// Zero Day Activity Queries
export const getZeroDayActivity = publicProcedure
  .input(getActivitiesSchema)
  .query(async ({ input }) => {
    const activity = await db
      .select()
      .from(zeroDayActivityTable)
      .where(
        eq(zeroDayActivityTable.work_order_site_id, input.work_order_site_id)
      )
      .limit(1);

    return activity[0] || null;
  });

export const getZeroDayActivityById = publicProcedure
  .input(getActivityByIdSchema)
  .query(async ({ input }) => {
    const activity = await db
      .select()
      .from(zeroDayActivityTable)
      .where(eq(zeroDayActivityTable.id, input.id))
      .limit(1);

    return activity[0] || null;
  });

// Zero Day Sample Queries
export const getZeroDaySample = publicProcedure
  .input(getActivitiesSchema)
  .query(async ({ input }) => {
    const sample = await db
      .select()
      .from(zeroDaySampleTable)
      .where(
        eq(zeroDaySampleTable.work_order_site_id, input.work_order_site_id)
      )
      .limit(1);

    return sample[0] || null;
  });

export const getZeroDaySampleById = publicProcedure
  .input(getActivityByIdSchema)
  .query(async ({ input }) => {
    const sample = await db
      .select()
      .from(zeroDaySampleTable)
      .where(eq(zeroDaySampleTable.id, input.id))
      .limit(1);

    return sample[0] || null;
  });

// TPH Activity Queries
export const getTphActivities = publicProcedure
  .input(getActivitiesSchema)
  .query(async ({ input }) => {
    const activities = await db
      .select()
      .from(tphActivityTable)
      .where(eq(tphActivityTable.work_order_site_id, input.work_order_site_id))
      .orderBy(tphActivityTable.created_at);

    return activities;
  });

export const getTphActivityById = publicProcedure
  .input(getActivityByIdSchema)
  .query(async ({ input }) => {
    const activity = await db
      .select()
      .from(tphActivityTable)
      .where(eq(tphActivityTable.id, input.id))
      .limit(1);

    return activity[0] || null;
  });

// Oil Zapper Activity Queries
export const getOilZapperActivities = publicProcedure
  .input(getActivitiesSchema)
  .query(async ({ input }) => {
    const activities = await db
      .select()
      .from(oilZapperActivityTable)
      .where(
        eq(oilZapperActivityTable.work_order_site_id, input.work_order_site_id)
      )
      .orderBy(oilZapperActivityTable.created_at);

    return activities;
  });

export const getOilZapperActivityById = publicProcedure
  .input(getActivityByIdSchema)
  .query(async ({ input }) => {
    const activity = await db
      .select()
      .from(oilZapperActivityTable)
      .where(eq(oilZapperActivityTable.id, input.id))
      .limit(1);

    return activity[0] || null;
  });

// Oil Zapper Indent Queries
export const getOilZapperIndents = publicProcedure
  .input(getActivityByIdSchema)
  .query(async ({ input }) => {
    const indents = await db
      .select()
      .from(oilZapperIndentTable)
      .where(eq(oilZapperIndentTable.oil_zapper_activity_id, input.id))
      .orderBy(oilZapperIndentTable.created_at);

    return indents;
  });

export const getOilZapperIndentById = publicProcedure
  .input(getActivityByIdSchema)
  .query(async ({ input }) => {
    const indent = await db
      .select()
      .from(oilZapperIndentTable)
      .where(eq(oilZapperIndentTable.id, input.id))
      .limit(1);

    return indent[0] || null;
  });
