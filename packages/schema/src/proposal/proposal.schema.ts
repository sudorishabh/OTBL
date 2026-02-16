import { z } from "zod";
import {
  codeValidator,
  titleValidator,
  longDescriptionValidator,
  positiveIntValidator,
  documentKeyValidator,
  currencyValidator,
  dateValidator,
} from "../validators";

// Base schemas

export const baseProposalSchema = z.object({
  code: codeValidator,
  title: titleValidator,
  description: longDescriptionValidator,
  document_key: documentKeyValidator,
  office_id: positiveIntValidator,
  proposal_amount: currencyValidator,
  proposal_submission_date: dateValidator,
});

// Mutation Schemas

export const createProposalSchema = baseProposalSchema.extend({
  client_id: positiveIntValidator,
});

export const updateProposalSchema = createProposalSchema.extend({
  proposal_id: positiveIntValidator,
});

// Query Schemas

export const getProposalsByClientSchema = z.object({
  client_id: positiveIntValidator,
});

export const getProposalByIdSchema = z.object({
  proposal_id: positiveIntValidator,
});
