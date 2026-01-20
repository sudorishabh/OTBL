import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { managerProcedure } from "../../middleware";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";
import { proposalSchemas } from "@pkg/schema";

const { proposalTable, clientTable } = schema;

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

        const result = await handleDatabaseOperation(async () => {
          return ctx.db.insert(proposalTable).values(input);
        }, "Failed to add proposal");

        return {
          success: true,
          proposalId: result[0].insertId,
        };
      }),
    ),
});
