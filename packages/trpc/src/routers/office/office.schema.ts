/**
 * Office Router Schemas
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
  positiveIntValidator,
  optionalPositiveIntValidator,
  searchQueryValidator,
} from "../../validation/validators";

const { STATUS } = constants;

export const statusEnum = z.enum([STATUS.ACTIVE, STATUS.INACTIVE]);
export const officeRoleEnum = z.enum(["manager", "operator"]);

/**
 * Office base schema
 */
const officeBaseSchema = z.object({
  name: nameValidator,
  address: addressValidator,
  state: stateValidator,
  city: cityValidator,
  pincode: pincodeValidator,
  gst_number: gstNumberValidator,
  email: emailValidator,
});

/**
 * Add office schema
 */
export const addOfficeSchema = officeBaseSchema.extend({
  manager_id: optionalPositiveIntValidator,
  operator_ids: z.array(positiveIntValidator).optional(),
  status: statusEnum.optional(),
});

/**
 * Edit office schema
 */
export const editOfficeSchema = officeBaseSchema.extend({
  id: positiveIntValidator,
  status: statusEnum.optional(),
});

/**
 * Get offices schema
 */
export const getOfficesSchema = z.object({
  searchQuery: searchQueryValidator,
  status: z.enum(["all", "active", "inactive"]).optional(),
  officeNamesOrder: z.enum(["asc", "desc", "latest", "oldest"]).optional(),
});

/**
 * Assign user to office schema
 */
export const assignUserToOfficeSchema = z.object({
  office_id: positiveIntValidator,
  user_id: positiveIntValidator,
  role: officeRoleEnum,
});

/**
 * Remove user from office schema
 */
export const removeUserFromOfficeSchema = z.object({
  office_id: positiveIntValidator,
  user_id: positiveIntValidator,
});

export const getOfficeSchema = z.object({ id: positiveIntValidator });
export const getOfficeWorkOrderScema = z.object({ id: positiveIntValidator });
export const getOfficeStatsSchema = z.object({ id: positiveIntValidator });
export const getOfficeUsersSchema = z.object({
  office_id: positiveIntValidator,
});

// Type exports
export type AddOfficeInput = z.infer<typeof addOfficeSchema>;
export type EditOfficeInput = z.infer<typeof editOfficeSchema>;
