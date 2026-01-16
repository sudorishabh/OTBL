import z from "zod";
import * as proposalSchema from "./proposal.schema";

export type createProposalType = z.infer<
  typeof proposalSchema.createProposalSchema
>;
export type updateProposalType = z.infer<
  typeof proposalSchema.updateProposalSchema
>;
