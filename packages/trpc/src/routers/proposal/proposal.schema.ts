/**
 * Proposal Router Schemas
 */
import { z } from "zod";
import {
  codeValidator,
  titleValidator,
  longDescriptionValidator,
  positiveIntValidator,
  documentKeyValidator,
} from "../../validation/validators";

/**
 * Add proposal schema
 */

export const baseProposalSchema = z.object({
  code: codeValidator,
  title: titleValidator,
  description: longDescriptionValidator,
  document_key: documentKeyValidator,
});

export const addProposalSchema = baseProposalSchema.extend({
  client_id: positiveIntValidator,
});

/**
 * Edit proposal schema
 */
export const editProposalSchema = addProposalSchema.partial().extend({
  id: positiveIntValidator,
});

/**
 * Get proposals by client schema
 */
export const getProposalsByClientSchema = z.object({
  client_id: positiveIntValidator,
});

// Type exports
export type BaseProposalInput = z.infer<typeof baseProposalSchema>;
export type AddProposalInput = z.infer<typeof addProposalSchema>;
export type EditProposalInput = z.infer<typeof editProposalSchema>;
