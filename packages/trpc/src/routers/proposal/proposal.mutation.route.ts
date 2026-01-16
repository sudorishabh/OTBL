import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { managerProcedure } from "../../middleware";
import { addProposalSchema } from "./proposal.schema";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const { proposalTable, clientTable } = schema;

export const proposalMutationRouter = router({
  /**
   * Add a new proposal - Manager or higher
   */
  addProposal: managerProcedure.input(addProposalSchema).mutation(
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
    })
  ),
});
