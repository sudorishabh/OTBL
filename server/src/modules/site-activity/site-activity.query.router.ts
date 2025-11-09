import { router } from "../../trpc";
import * as siteActivityQueries from "./site-activity.query.route";

export const siteActivityQueryRouter = router({
  getZeroDayActivity: siteActivityQueries.getZeroDayActivity,
  getZeroDayActivityById: siteActivityQueries.getZeroDayActivityById,
  getZeroDaySample: siteActivityQueries.getZeroDaySample,
  getZeroDaySampleById: siteActivityQueries.getZeroDaySampleById,
  getTphActivities: siteActivityQueries.getTphActivities,
  getTphActivityById: siteActivityQueries.getTphActivityById,
  getOilZapperActivities: siteActivityQueries.getOilZapperActivities,
  getOilZapperActivityById: siteActivityQueries.getOilZapperActivityById,
  getOilZapperIndents: siteActivityQueries.getOilZapperIndents,
  getOilZapperIndentById: siteActivityQueries.getOilZapperIndentById,
});
