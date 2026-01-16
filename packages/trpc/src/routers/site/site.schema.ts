/**
 * Site Router Schemas
 */
import { z } from "zod";
import { constants } from "@pkg/utils";
import {
  nameValidator,
  addressValidator,
  cityValidator,
  stateValidator,
  pincodeValidator,
  positiveIntValidator,
  searchQueryValidator,
} from "../../validation/validators";

const { STATUS } = constants;

export const statusEnum = z.enum([STATUS.ACTIVE, STATUS.INACTIVE]);

/**
 * Site base schema
 */
export const siteBaseSchema = z.object({
  name: nameValidator,
  address: addressValidator,
  state: stateValidator,
  city: cityValidator,
  pincode: pincodeValidator,
});

/**
 * Add site schema
 */
export const addSiteSchema = siteBaseSchema.extend({
  office_id: positiveIntValidator,
  operator_ids: z.array(positiveIntValidator).optional(),
});

/**
 * Edit site schema
 */
export const editSiteSchema = siteBaseSchema.partial().extend({
  id: positiveIntValidator,
});

/**
 * Get site by ID schema
 */
export const getSiteSchema = z.object({ id: positiveIntValidator });

/**
 * Get all sites paginated schema
 */
export const getAllSitesPaginatedSchema = z.object({
  office_id: positiveIntValidator,
  searchQuery: searchQueryValidator,
  status: z.enum(["all", "active", "inactive"]).optional(),
});

// Type exports
export type SiteBaseInput = z.infer<typeof siteBaseSchema>;
export type AddSiteInput = z.infer<typeof addSiteSchema>;
export type EditSiteInput = z.infer<typeof editSiteSchema>;
