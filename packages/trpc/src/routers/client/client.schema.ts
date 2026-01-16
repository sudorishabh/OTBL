/**
 * Client Router Schemas
 */
import { z } from "zod";
import { constants } from "@pkg/utils";
import {
  nameValidator,
  emailValidator,
  addressValidator,
  cityValidator,
  stateValidator,
  pincodeValidator,
  gstNumberValidator,
  contactNumberValidator,
  positiveIntValidator,
  searchQueryValidator,
} from "../../validation/validators";

const { STATUS } = constants;

export const statusEnum = z.enum([STATUS.ACTIVE, STATUS.INACTIVE]);

/**
 * Add client schema
 */
export const createClientSchema = z.object({
  name: nameValidator,
  address: addressValidator,
  state: stateValidator,
  city: cityValidator,
  pincode: pincodeValidator,
  gst_number: gstNumberValidator,
  contact_number: contactNumberValidator,
  email: emailValidator,
  status: statusEnum.optional(),
});

/**
 * Edit client schema
 */
export const editClientSchema = createClientSchema.extend({
  id: positiveIntValidator,
});

/**
 * Get all clients schema
 */
export const getAllClientsSchema = z.object({
  searchQuery: searchQueryValidator,
  status: z.enum(["all", "active", "inactive"]).optional(),
});

export const getAllClientContactsSchema = z.object({
  searchQuery: z.string().optional(),
  clientId: z.string().optional(),
});

/**
 * Client contact schema
 */
export const addClientContactSchema = z.object({
  client_id: positiveIntValidator,
  name: nameValidator,
  designation: z
    .string()
    .trim()
    .max(100, "Designation cannot exceed 100 characters")
    .optional(),
  contact_number: contactNumberValidator,
  email: emailValidator,
  contact_type: z
    .string()
    .trim()
    .max(50, "Contact type cannot exceed 50 characters")
    .optional(),
});

export const editClientContactSchema = addClientContactSchema.partial().extend({
  id: positiveIntValidator,
});

export const getClientSchema = z.object({ id: positiveIntValidator });
export const getClientContactSchema = z.object({ id: positiveIntValidator });
export const deleteClientContactSchema = z.object({ id: positiveIntValidator });
export const deleteClientSchema = z.object({ id: positiveIntValidator });

export const getClientContactsSchema = z.object({
  client_id: z.number(),
});

// Compound schemas
export const addClientWithContactsSchema = z.object({
  client: addClientSchema,
  contacts: z
    .array(addClientContactSchema.omit({ client_id: true }))
    .optional(),
});

export const editClientWithContactsSchema = z.object({
  clientId: positiveIntValidator,
  client: addClientSchema.partial(),
  contactsToAdd: z
    .array(addClientContactSchema.omit({ client_id: true }))
    .optional(),
  contactsToRemove: z.array(positiveIntValidator).optional(),
});

// Type exports
export type AddClientInput = z.infer<typeof addClientSchema>;
export type EditClientInput = z.infer<typeof editClientSchema>;
export type AddClientContactInput = z.infer<typeof addClientContactSchema>;
