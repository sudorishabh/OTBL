import z from "zod";
import * as siteSchema from "./site.schema";

export type createSiteType = z.infer<typeof siteSchema.createSiteSchema>;
export type updateSiteType = z.infer<typeof siteSchema.updateSiteSchema>;
