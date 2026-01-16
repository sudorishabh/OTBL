/**
 * Technology Router Schemas
 */
import { z } from "zod";
import { positiveIntValidator } from "../../validation/validators";

/**
 * Get technologies query schema
 */
export const getTechnologiesSchema = z
  .object({
    status: z.enum(["active", "inactive", "all"]).optional().default("active"),
  })
  .optional();

/**
 * Get activity types by technology schema
 */
export const getActivityTypesByTechnologySchema = z.object({
  technology_id: positiveIntValidator,
});
