import { z } from "zod";

export const addActivitySchema = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  description: z.string(),
  activity_type: z.enum(["insitu", "exsitu", "general"]).default("general"),
  activity_sub_type: z
    .enum([
      "zero_day_activity",
      "zero_day_sample",
      "tph_activity",
      "oil_zapper_activity",
      "other",
    ])
    .optional(),
});

export const editActivitySchma = z.object({
  name: z.string().min(1, { message: "Activity name is required" }),
  description: z
    .string()
    .min(1, { message: "Activity description is required" }),
  id: z.number().min(1, { message: "Activity Id is required" }),
  activity_type: z.enum(["insitu", "exsitu", "general"]).optional(),
  activity_sub_type: z
    .enum([
      "zero_day_activity",
      "zero_day_sample",
      "tph_activity",
      "oil_zapper_activity",
      "other",
    ])
    .optional(),
});

// Schema for adding activities to work order sites
export const addSiteActivitySchema = z.object({
  wo_site_id: z.number(),
  activity_id: z.number(),
  activity_description: z.string().optional(),
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
});

// Schema for 0 Day Activity specific data
export const zeroDayActivityDataSchema = z.object({
  site_activity_id: z.number(),
  length_metric: z.number().optional(),
  width_metric: z.number().optional(),
  depth_metric: z.number().optional(),
  volume_informed: z.number().optional(),
  document_url: z.string().optional(),
});

// Schema for 0 Day Sample specific data
export const zeroDaySampleDataSchema = z.object({
  site_activity_id: z.number(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  volume_m3: z.number().optional(),
  density: z.number().optional(),
  final_value: z.number().optional(),
  document_url: z.string().optional(),
});

// Schema for TPH Activity specific data
export const tphActivityDataSchema = z.object({
  site_activity_id: z.number(),
  sample_collection_date: z.string().or(z.date()).optional(),
  sample_send_date: z.string().or(z.date()).optional(),
  sample_report_received_date: z.string().or(z.date()).optional(),
  tph_value: z.number().optional(),
  lab_name: z.string().optional(),
  lab_contact: z.string().optional(),
  lab_address: z.string().optional(),
  report_document_url: z.string().optional(),
});

// Schema for Oil Zapper Activity specific data
export const oilZapperActivityDataSchema = z.object({
  site_activity_id: z.number(),
  first_intimation_date: z.string().or(z.date()).optional(),
  first_intimation_raised: z.enum(["yes", "no"]).default("no"),
  intimation_document_url: z.string().optional(),
  activity_completed_date: z.string().or(z.date()).optional(),
  completion_notes: z.string().optional(),
  completion_document_url: z.string().optional(),
});

// Schema for updating activity-specific data
export const updateZeroDayActivityDataSchema = z.object({
  id: z.number(),
  length_metric: z.number().optional(),
  width_metric: z.number().optional(),
  depth_metric: z.number().optional(),
  volume_informed: z.number().optional(),
  document_url: z.string().optional(),
});

export const updateZeroDaySampleDataSchema = z.object({
  id: z.number(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  volume_m3: z.number().optional(),
  density: z.number().optional(),
  final_value: z.number().optional(),
  document_url: z.string().optional(),
});

export const updateTphActivityDataSchema = z.object({
  id: z.number(),
  sample_collection_date: z.string().or(z.date()).optional(),
  sample_send_date: z.string().or(z.date()).optional(),
  sample_report_received_date: z.string().or(z.date()).optional(),
  tph_value: z.number().optional(),
  lab_name: z.string().optional(),
  lab_contact: z.string().optional(),
  lab_address: z.string().optional(),
  report_document_url: z.string().optional(),
});

export const updateOilZapperActivityDataSchema = z.object({
  id: z.number(),
  first_intimation_date: z.string().or(z.date()).optional(),
  first_intimation_raised: z.enum(["yes", "no"]).optional(),
  intimation_document_url: z.string().optional(),
  activity_completed_date: z.string().or(z.date()).optional(),
  completion_notes: z.string().optional(),
  completion_document_url: z.string().optional(),
});
