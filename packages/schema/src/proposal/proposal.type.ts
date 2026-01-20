import z from "zod";
import * as proposalSchema from "./proposal.schema";

export type BaseProposalInput = z.infer<
  typeof proposalSchema.baseProposalSchema
>;
export type createProposalType = z.infer<
  typeof proposalSchema.createProposalSchema
>;
export type updateProposalType = z.infer<
  typeof proposalSchema.updateProposalSchema
>;
