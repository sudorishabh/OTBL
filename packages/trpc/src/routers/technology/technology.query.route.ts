import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import {
  getTechnologiesSchema,
  getActivityTypesByTechnologySchema,
} from "./technology.schema";
import { handleQuery } from "../../helper/typed-handler";
import { handleDatabaseOperation } from "../../errors";

const { technologyTable, activityTypeTable } = schema;

export const technologyQueryRouter = router({
  // Get all technologies
  getTechnologies: publicProcedure.input(getTechnologiesSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const status = input?.status || "active";

      let technologies;
      if (status === "all") {
        technologies = await handleDatabaseOperation(async () => {
          return ctx.db.select().from(technologyTable);
        }, "Failed to fetch technologies");
      } else {
        technologies = await handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(technologyTable)
            .where(eq(technologyTable.status, status));
        }, "Failed to fetch technologies");
      }

      return { technologies };
    })
  ),

  // Get activity types by technology ID
  getActivityTypesByTechnology: publicProcedure
    .input(getActivityTypesByTechnologySchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const activityTypes = await handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(activityTypeTable)
            .where(eq(activityTypeTable.technology_id, input.technology_id));
        }, "Failed to fetch activity types");

        return { activityTypes };
      })
    ),
});
