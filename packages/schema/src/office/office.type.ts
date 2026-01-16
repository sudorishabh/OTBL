import z from "zod";
import * as officeSchema from "./office.schema";

export type createOfficeType = z.infer<typeof officeSchema.createOfficeSchema>;
export type updateOfficeType = z.infer<typeof officeSchema.updateOfficeSchema>;
