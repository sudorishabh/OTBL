import { router, publicProcedure } from "@/trpc";
import { db } from "@/db";
import { ActivityTable } from "@/db/schema";

export const activityQueryRoutes = router({
  getActivities: publicProcedure.query(async () => {
    const activities = await db.select().from(ActivityTable);
    return activities;
  }),
});
