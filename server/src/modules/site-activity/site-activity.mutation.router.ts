import { router } from "../../trpc";
import * as siteActivityMutations from "./site-activity.mutation.route";

export const siteActivityMutationRouter = router({
  createZeroDayActivity: siteActivityMutations.createZeroDayActivity,
  updateZeroDayActivity: siteActivityMutations.updateZeroDayActivity,
  deleteZeroDayActivity: siteActivityMutations.deleteZeroDayActivity,
  createZeroDaySample: siteActivityMutations.createZeroDaySample,
  updateZeroDaySample: siteActivityMutations.updateZeroDaySample,
  deleteZeroDaySample: siteActivityMutations.deleteZeroDaySample,
  createTphActivity: siteActivityMutations.createTphActivity,
  updateTphActivity: siteActivityMutations.updateTphActivity,
  deleteTphActivity: siteActivityMutations.deleteTphActivity,
  createOilZapperActivity: siteActivityMutations.createOilZapperActivity,
  updateOilZapperActivity: siteActivityMutations.updateOilZapperActivity,
  deleteOilZapperActivity: siteActivityMutations.deleteOilZapperActivity,
  createOilZapperIndent: siteActivityMutations.createOilZapperIndent,
  updateOilZapperIndent: siteActivityMutations.updateOilZapperIndent,
  deleteOilZapperIndent: siteActivityMutations.deleteOilZapperIndent,
});
