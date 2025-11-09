import { z } from "zod";

// Get All Clients paginated schema
export const getAllClientsPaginatedSchema = z.object({
  page: z.number().min(1, "Page number must be at least 1"),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100"),
  searchQuery: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).optional(),
});

// Get All Client Contacts paginated schema
export const getAllClientContactsPaginatedSchema = z.object({
  page: z.number().min(1, "Page number must be at least 1"),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100"),
  searchQuery: z.string().optional(),
  clientId: z.string().optional(),
});

// CLIENT SCHEMAS
export const addClientSchema = z.object({
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
  email: z.email({ message: "Invalid email address" }),
  status: z.enum(["active", "inactive"]).optional(),
});

export const editClientSchema = addClientSchema.partial().extend({
  id: z.number(),
});

export const getClientSchema = z.object({
  id: z.number(),
});

// CLIENT CONTACT SCHEMAS
export const addClientContactSchema = z.object({
  client_id: z.number(),
  name: z.string().min(1, { message: "Contact name is required" }),
  designation: z.string().optional(),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required" })
    .max(15),
  email: z.string().email({ message: "Invalid email address" }),
  contact_type: z.string().optional(),
});

export const editClientContactSchema = addClientContactSchema.partial().extend({
  id: z.number(),
});

export const getClientContactSchema = z.object({
  id: z.number(),
});

export const getClientContactsSchema = z.object({
  client_id: z.number(),
});

export const deleteClientContactSchema = z.object({
  id: z.number(),
});

export const deleteClientSchema = z.object({
  id: z.number(),
});

// Combined schema for adding client with contacts
export const addClientWithContactsSchema = z.object({
  client: addClientSchema,
  contacts: z
    .array(addClientContactSchema.omit({ client_id: true }))
    .optional(),
});

// Combined schema for editing client with contacts
export const editClientWithContactsSchema = z.object({
  clientId: z.number(),
  client: addClientSchema.partial(),
  contactsToAdd: z
    .array(addClientContactSchema.omit({ client_id: true }))
    .optional(),
  contactsToRemove: z.array(z.number()).optional(),
});
