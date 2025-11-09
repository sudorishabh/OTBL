import { z } from "zod";

export const addSiteSchema = z.object({
  name: z.string().min(1, { message: "Site name is required" }),
  address: z.string().min(1, { message: "Site address is required" }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  pincode: z.string().min(1, { message: "Pincode is required." }).max(10),
  contact_person: z.string().min(1, { message: "Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.email({ message: "Invalid email address." }),
});

export const editSiteSchema = addSiteSchema.partial().extend({
  id: z.number(),
});

// QUERY

export const getSiteSchema = z.object({
  id: z.number(),
});

// Get All Sites paginated schema
export const getAllSitesPaginatedSchema = z.object({
  page: z.number().min(1, "Page number must be at least 1"),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100"),
  searchQuery: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).optional(),
  siteNamesOrder: z.enum(["asc", "desc", "latest", "oldest"]).optional(),
});
