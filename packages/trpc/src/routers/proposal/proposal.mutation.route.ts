import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { managerProcedure } from "../../middleware";
import { notFound, fromDatabaseError } from "../../errors";
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
          throw notFound("Client", input.client_id, {
            userMessage: "The selected client doesn't exist.",
          });
        }

        // Verify office exists
        const office = await ctx.db
          .select()
          .from(officeTable)
          .where(eq(officeTable.id, input.office_id));

        if (office.length === 0) {
          throw notFound("Office", input.office_id, {
            userMessage: "The selected office doesn't exist.",
          });
        }

        try {
          const result = await ctx.db.insert(proposalTable).values({
            ...input,
          });

          return {
            success: true,
            proposalId: result[0].insertId,
          };
        } catch (error) {
          throw fromDatabaseError(error, "Creating proposal");
        }
      }),
    ),
});
