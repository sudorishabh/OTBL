import { router, publicProcedure } from "@/trpc";
import { db } from "@/db";
import {
  activityTable,
  siteActivityTable,
  zeroDayActivityTable,
  zeroDaySampleTable,
  tphActivityTable,
  oilZapperActivityTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const activityQueryRoutes = router({
  getActivities: publicProcedure.query(async () => {
    const activities = await db.select().from(activityTable);
    return activities;
  }),

  getActivitiesByType: publicProcedure
    .input(
      z.object({
        activity_type: z.enum(["insitu", "exsitu", "general"]),
      })
    )
    .query(async ({ input }) => {
      const activities = await db
        .select()
        .from(activityTable)
        .where(eq(activityTable.activity_type, input.activity_type));
      return activities;
    }),

  getSiteActivities: publicProcedure
    .input(z.object({ wo_site_id: z.number() }))
    .query(async ({ input }) => {
      const siteActivities = await db
        .select()
        .from(siteActivityTable)
        .where(eq(siteActivityTable.wo_site_id, input.wo_site_id));
      return siteActivities;
    }),

  getZeroDayActivityData: publicProcedure
    .input(z.object({ site_activity_id: z.number() }))
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(zeroDayActivityTable)
        .where(
          eq(zeroDayActivityTable.site_activity_id, input.site_activity_id)
        );
      return data[0] || null;
    }),

  getZeroDaySampleData: publicProcedure
    .input(z.object({ site_activity_id: z.number() }))
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(zeroDaySampleTable)
        .where(eq(zeroDaySampleTable.site_activity_id, input.site_activity_id));
      return data[0] || null;
    }),

  getTphActivityData: publicProcedure
    .input(z.object({ site_activity_id: z.number() }))
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(tphActivityTable)
        .where(eq(tphActivityTable.site_activity_id, input.site_activity_id));
      return data[0] || null;
    }),

  getOilZapperActivityData: publicProcedure
    .input(z.object({ site_activity_id: z.number() }))
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(oilZapperActivityTable)
        .where(
          eq(oilZapperActivityTable.site_activity_id, input.site_activity_id)
        );
      return data[0] || null;
    }),
});
