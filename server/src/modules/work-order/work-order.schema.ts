import { z } from "zod";

// Schema for creating a new site (nested in work order)
export const newSiteSchema = z.object({
  name: z.string().min(1, { message: "Site name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
  pincode: z.string().min(1, { message: "Pincode is required" }).max(10),
  contact_person: z.string().min(1, { message: "Contact person is required" }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required" })
    .max(15),
  email: z.string().email({ message: "Valid email is required" }),
});

// Schema for creating a new client (nested in work order)
export const newClientSchema = z.object({
  name: z.string().min(1, { message: "Client name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  state: z.string().min(1, { message: "State is required" }),
  city: z.string().min(1, { message: "City is required" }),
  pincode: z.string().min(1, { message: "Pincode is required" }).max(10),
  gst_number: z
    .string()
    .min(15, { message: "GST number must be 15 characters" })
    .max(15),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required" })
    .max(15),
  email: z.string().email({ message: "Valid email is required" }),
});

// Schema for work order site
export const workOrderSiteSchema = z.object({
  site_id: z.number().optional(), // Optional because it might be a new site
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),
  metric_ton: z.number().optional(),
  metric_ton_rate: z.number().optional(),
  budget_amount: z.number().optional(),
});

// Main schema for creating a work order
export const createWorkOrderSchema = z
  .object({
    // Basic work order info
    code: z.string().min(1, { message: "Code is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    office_id: z.number(),

    // Client info - either existing or new
    client_id: z.number().optional(),
    newClient: newClientSchema.optional(),

    // Dates
    start_date: z.string().or(z.date()),
    end_date: z.string().or(z.date()),
    handing_over_date: z.string().or(z.date()),

    // Agreement details
    agreement_number: z
      .string()
      .min(1, { message: "Agreement number is required" }),
    agreement_url: z.string().optional(),

    // Metrics (optional)
    metric_ton: z.number().optional(),
    metric_ton_rate: z.number().optional(),

    // Budget and description
    description: z.string().min(1, { message: "Description is required" }),
    budget_amount: z.number().positive(),
    expense_amount: z.number().default(0),
    status: z.enum(["pending", "completed", "cancelled"]).default("pending"),

    // Sites - either existing or new
    existingSiteIds: z.array(z.number()).optional(),
    newSites: z.array(newSiteSchema).optional(),

    // Site-specific details (mapped by index for new sites, by ID for existing)
    workOrderSites: z.array(workOrderSiteSchema).optional(),
  })
  .refine((data) => data.client_id || data.newClient, {
    message: "Either client_id or newClient must be provided",
    path: ["client_id"],
  })
  .refine(
    (data) => {
      const hasExistingSites =
        data.existingSiteIds && data.existingSiteIds.length > 0;
      const hasNewSites = data.newSites && data.newSites.length > 0;
      return hasExistingSites || hasNewSites;
    },
    {
      message: "At least one site (existing or new) must be provided",
      path: ["existingSiteIds"],
    }
  );

// Schema for editing a work order
export const editWorkOrderSchema = z.object({
  id: z.number(),
  code: z.string().optional(),
  title: z.string().optional(),
  client_id: z.number().optional(),
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  handing_over_date: z.string().or(z.date()).optional(),
  agreement_number: z.string().optional(),
  agreement_url: z.string().optional(),
  metric_ton: z.number().optional(),
  metric_ton_rate: z.number().optional(),
  description: z.string().optional(),
  budget_amount: z.number().optional(),
  expense_amount: z.number().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  cancellation_reason: z.string().optional(),
});

// Query schemas
export const getWorkOrderSchema = z.object({
  id: z.number(),
});

export const getWorkOrdersByOfficeSchema = z.object({
  office_id: z.number(),
});

export const getWorkOrdersByClientSchema = z.object({
  client_id: z.number(),
});

export const deleteWorkOrderSchema = z.object({
  id: z.number(),
});
