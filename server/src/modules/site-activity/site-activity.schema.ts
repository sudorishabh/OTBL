import { z } from "zod";

// Zero Day Activity Schema
export const createZeroDayActivitySchema = z.object({
  work_order_site_id: z.number(),
  activity_description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  length_metric: z.number().optional(),
  width_metric: z.number().optional(),
  depth_metric: z.number().optional(),
  volume_informed: z.number().optional(),
  document_url: z.string().optional(),
});

export const updateZeroDayActivitySchema = z.object({
  id: z.number(),
  activity_description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  length_metric: z.number().optional(),
  width_metric: z.number().optional(),
  depth_metric: z.number().optional(),
  volume_informed: z.number().optional(),
  document_url: z.string().optional(),
});

// Zero Day Sample Schema
export const createZeroDaySampleSchema = z.object({
  work_order_site_id: z.number(),
  activity_description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  volume_a1: z.number().optional(),
  density_a2: z.number().optional(),
  result_a: z.number().optional(),
});

export const updateZeroDaySampleSchema = z.object({
  id: z.number(),
  activity_description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  volume_a1: z.number().optional(),
  density_a2: z.number().optional(),
  result_a: z.number().optional(),
});

// TPH Activity Schema
export const createTphActivitySchema = z.object({
  work_order_site_id: z.number(),
  activity_description: z.string().optional(),
  sample_collection_date: z.string(),
  sample_send_date: z.string(),
  sample_report_received: z.enum(["yes", "no"]).default("no"),
  report_document_url: z.string().optional(),
  tph_value: z.number().optional(),
  lab_info: z.string().optional(),
});

export const updateTphActivitySchema = z.object({
  id: z.number(),
  activity_description: z.string().optional(),
  sample_collection_date: z.string().optional(),
  sample_send_date: z.string().optional(),
  sample_report_received: z.enum(["yes", "no"]).optional(),
  report_document_url: z.string().optional(),
  tph_value: z.number().optional(),
  lab_info: z.string().optional(),
});

// Oil Zapper Activity Schema
export const createOilZapperActivitySchema = z.object({
  work_order_site_id: z.number(),
  activity_description: z.string().optional(),
  sent_kg: z.number().optional(),
  sent_date: z.string().optional(),
  bill_document_url: z.string().optional(),
});

export const updateOilZapperActivitySchema = z.object({
  id: z.number(),
  activity_description: z.string().optional(),
  sent_kg: z.number().optional(),
  sent_date: z.string().optional(),
  bill_document_url: z.string().optional(),
});

// Oil Zapper Indent Schema
export const createOilZapperIndentSchema = z.object({
  oil_zapper_activity_id: z.number(),
  description: z.string().optional(),
  date: z.string(),
  kg: z.number().optional(),
  proposed_amount: z.number().optional(),
});

export const updateOilZapperIndentSchema = z.object({
  id: z.number(),
  description: z.string().optional(),
  date: z.string().optional(),
  kg: z.number().optional(),
  proposed_amount: z.number().optional(),
});

// Query schemas
export const getActivitiesSchema = z.object({
  work_order_site_id: z.number(),
});

export const getActivityByIdSchema = z.object({
  id: z.number(),
});

export const deleteActivitySchema = z.object({
  id: z.number(),
});
