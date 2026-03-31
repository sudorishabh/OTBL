/**
 * Site Activity Router Schemas
 */
import { z } from "zod";
import {
  positiveIntValidator,
  nonNegativeNumberValidator,
  dateValidator,
} from "../../validation/validators";

// Enums
export const workOrderStatusEnum = z.enum([
  "pending",
  "completed",
  "cancelled",
]);
export const yesNoEnum = z.enum(["yes", "no"]);

// Activity Phase enum
export const activityPhaseEnum = z.enum([
  "work_estimate",
  "order",
  "completion",
]);

// Activity item table names — must match MySQL tables in @pkg/db schema
export const activityItemTableEnum = z.enum([
  "clean_soil_area",
  "lifting_oil_slush",
  "excav_cont_soil",
  "trans_cont_soil",
  "refill_excav_soil",
  "biorem_cont_soil",
  "bio_samples",
  "bio_oil_zapping",
]);

/**
 * Site Activity (Main Activity) Schemas
 */
export const createSiteActivitySchema = z.object({
  client_id: positiveIntValidator,
  work_order_id: positiveIntValidator,
  work_order_site_id: positiveIntValidator,
  job_number: z.string().min(1, "Job number is required").max(255),
  area: z.string().min(1, "Area is required").max(255),
  installation: z.string().min(1, "Installation is required").max(255),
  joint_estimate_number: z
    .string()
    .min(1, "Joint estimate number is required")
    .max(255),
  land_owner_name: z.string().min(1, "Land owner name is required").max(255),
  start_date: z.string().or(dateValidator),
  end_date: z.string().or(dateValidator),
  remark: z.string().optional(),
  // Selected item types for this activity
  selected_items: z.array(activityItemTableEnum).optional(),
});

export const updateSiteActivitySchema = createSiteActivitySchema
  .partial()
  .extend({
    id: positiveIntValidator,
  });

export const getSiteActivitiesSchema = z.object({
  work_order_site_id: positiveIntValidator,
});

export const getSiteActivityByIdSchema = z.object({
  id: positiveIntValidator,
});

export const deleteSiteActivitySchema = z.object({
  id: positiveIntValidator,
});

/**
 * Site Activity Items Schemas
 */
export const addActivityItemSchema = z.object({
  site_activity_id: positiveIntValidator,
  item_table_name: activityItemTableEnum,
  item_id: positiveIntValidator,
});

export const removeActivityItemSchema = z.object({
  id: positiveIntValidator,
});

export const getActivityItemsSchema = z.object({
  site_activity_id: positiveIntValidator,
});

/**
 * Zero Day Activity schema
 */
export const createZeroDayActivitySchema = z.object({
  work_order_site_id: positiveIntValidator,
  site_activity_id: positiveIntValidator.optional(),
  type: activityPhaseEnum.optional().default("work_estimate"),
  amount: nonNegativeNumberValidator.optional(),
  length_metric: nonNegativeNumberValidator.optional(),
  width_metric: nonNegativeNumberValidator.optional(),
  depth_metric: nonNegativeNumberValidator.optional(),
  volume_informed: nonNegativeNumberValidator.optional(),
  document_key: z.string().optional(),
});

export const updateZeroDayActivitySchema = createZeroDayActivitySchema
  .partial()
  .extend({
    id: positiveIntValidator,
  });

/**
 * Zero Day Sample schema
 */
export const createZeroDaySampleSchema = z.object({
  work_order_site_id: positiveIntValidator,
  site_activity_id: positiveIntValidator.optional(),
  activity_description: z.string().max(2000).optional(),
  status: workOrderStatusEnum.optional().default("pending"),
  type: activityPhaseEnum.optional().default("work_estimate"),
  amount: nonNegativeNumberValidator.optional(),
  length: nonNegativeNumberValidator.optional(),
  width: nonNegativeNumberValidator.optional(),
  height: nonNegativeNumberValidator.optional(),
  volume_a1: nonNegativeNumberValidator.optional(),
  density_a2: nonNegativeNumberValidator.optional(),
  result_a: nonNegativeNumberValidator.optional(),
  document_key: z.string().optional(),
});

export const updateZeroDaySampleSchema = createZeroDaySampleSchema
  .partial()
  .extend({
    id: positiveIntValidator,
  });

/**
 * TPH Activity schema
 */
export const createTphActivitySchema = z.object({
  work_order_site_id: positiveIntValidator,
  site_activity_id: positiveIntValidator.optional(),
  activity_description: z.string().max(2000).optional(),
  sample_collection_date: z.string().or(dateValidator),
  sample_send_date: z.string().or(dateValidator),
  sample_report_received: yesNoEnum.optional().default("no"),
  type: activityPhaseEnum.optional().default("work_estimate"),
  amount: nonNegativeNumberValidator.optional(),
  document_key: z.string().optional(),
  tph_value: nonNegativeNumberValidator.optional(),
  lab_info: z
    .string()
    .max(500, "Lab info cannot exceed 500 characters")
    .optional(),
});

export const updateTphActivitySchema = createTphActivitySchema
  .partial()
  .extend({
    id: positiveIntValidator,
  });

/**
 * Oil Zapper Activity schema
 */
export const createOilZapperActivitySchema = z.object({
  work_order_site_id: positiveIntValidator,
  site_activity_id: positiveIntValidator.optional(),
  activity_description: z.string().max(2000).optional(),
  type: activityPhaseEnum.optional().default("work_estimate"),
  amount: nonNegativeNumberValidator.optional(),
  length: nonNegativeNumberValidator.optional(),
  width: nonNegativeNumberValidator.optional(),
  depth: nonNegativeNumberValidator.optional(),
  document_key: z.string().optional(),
});

export const updateOilZapperActivitySchema = createOilZapperActivitySchema
  .partial()
  .extend({
    id: positiveIntValidator,
  });

/**
 * Oil Zapper Indent schema
 */
export const createOilZapperIndentSchema = z.object({
  oz_activity_id: positiveIntValidator,
  description: z.string().optional(),
  date: z.string(),
  kg: z.number().optional(),
  proposed_amount: z.number().optional(),
});

export const updateOilZapperIndentSchema = z.object({
  id: positiveIntValidator,
  description: z.string().optional(),
  date: z.string().optional(),
  kg: z.number().optional(),
  proposed_amount: z.number().optional(),
});

/**
 * Query schemas
 */
export const getActivitiesSchema = z.object({
  work_order_site_id: positiveIntValidator,
});

export const getActivityByIdSchema = z.object({ id: positiveIntValidator });
export const deleteActivitySchema = z.object({ id: positiveIntValidator });

// Type exports
export type CreateZeroDayActivityInput = z.infer<
  typeof createZeroDayActivitySchema
>;
export type CreateZeroDaySampleInput = z.infer<
  typeof createZeroDaySampleSchema
>;
export type CreateTphActivityInput = z.infer<typeof createTphActivitySchema>;
export type CreateOilZapperActivityInput = z.infer<
  typeof createOilZapperActivitySchema
>;
