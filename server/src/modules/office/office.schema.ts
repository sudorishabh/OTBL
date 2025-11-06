import { z } from "zod";

// MUTATION

export const addOfficeSchema = z.object({
  name: z.string().min(1, { message: "Office name is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  gst_number: z.string().min(1, { message: "GST number is required." }).max(15),
  pincode: z.string().min(1, { message: "Pincode is required." }).max(10),
  contact_person: z.string().min(1, { message: "Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.string().email({ message: "Invalid email address." }),
  manager_id: z.number().int().positive().optional(),
  operator_ids: z.array(z.number().int().positive()).optional(),
});

export const editOfficeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, { message: "Office name is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  gst_number: z.string().min(1, { message: "GST number is required." }).max(15),
  pincode: z.string().min(1, { message: "Pincode is required." }).max(10),
  contact_person: z.string().min(1, { message: "Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.string().email({ message: "Invalid email address." }),
});

// QUERY

export const getOfficeSchema = z.object({
  id: z.number().int().positive(),
});

export const getOfficeWorkOrderScema = z.object({
  id: z.number().int().positive(),
});

export const getOfficeStatsSchema = z.object({
  id: z.number().int().positive(),
});

export const getOfficesPaginatedSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

export const assignUserToOfficeSchema = z.object({
  office_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  role: z.enum(["manager", "operator"]),
});

export const removeUserFromOfficeSchema = z.object({
  office_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
});

export const getOfficeUsersSchema = z.object({
  office_id: z.number().int().positive(),
});
