import { router, publicProcedure } from "../../trpc";
import { addActivitySchema, editActivitySchma } from "./activity.schema";
import { addActivity, editActivity } from "./activity.mutation.controller";

export const activityMutationRouter = router({
  addActivity: publicProcedure
    .input(addActivitySchema)
    .mutation(async ({ input }) => await addActivity(input)),

  editActivity: publicProcedure
    .input(editActivitySchma)
    .mutation(async ({ input }) => await editActivity(input)),
});
