import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { managerProcedure } from "../../middleware";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";
import { proposalSchemas } from "@pkg/schema";

const { proposalTable, clientTable, officeTable } = schema;

export const proposalMutationRouter = router({
  createProposal: managerProcedure
    .input(proposalSchemas.createProposalSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        // Verify client exists
        const client = await ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.client_id));

        if (client.length === 0) {
          throwNotFoundError("Client", input.client_id);
        }

        // Verify office exists
        const office = await ctx.db
          .select()
          .from(officeTable)
          .where(eq(officeTable.id, input.office_id));

        if (office.length === 0) {
          throwNotFoundError("Office", input.office_id);
        }
        console.log("input", input);

        const result = await handleDatabaseOperation(async () => {
          return ctx.db.insert(proposalTable).values({
            ...input,
            proposal_amount: input.proposal_amount.toString(),
          });
        }, "Failed to add proposal");

        return {
          success: true,
          proposalId: result[0].insertId,
        };
      }),
    ),
});
