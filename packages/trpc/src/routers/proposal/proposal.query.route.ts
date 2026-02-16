import { desc, eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { fromDatabaseError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";
import { proposalSchemas } from "@pkg/schema";

const { proposalTable, workOrderTable } = schema;

export const proposalQueryRouter = router({
  // Get proposals for a specific client (no pagination)
  getProposalsByClient: publicProcedure
    .input(proposalSchemas.getProposalsByClientSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { client_id } = input;

        try {
          const proposals = await ctx.db
            .select({ proposal: proposalTable, workOrder: workOrderTable })
            .from(proposalTable)
            .where(eq(proposalTable.client_id, client_id))
            .leftJoin(
              workOrderTable,
              eq(workOrderTable.proposal_id, proposalTable.id),
            )
            .orderBy(desc(proposalTable.created_at));

          return { proposals };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching proposals");
        }
      }),
    ),

  // Get single proposal by ID with optional work order
  getProposalById: publicProcedure
    .input(proposalSchemas.getProposalByIdSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { proposal_id } = input;

        try {
          const result = await ctx.db
            .select({ proposal: proposalTable, workOrder: workOrderTable })
            .from(proposalTable)
            .where(eq(proposalTable.id, proposal_id))
            .leftJoin(
              workOrderTable,
              eq(workOrderTable.proposal_id, proposalTable.id),
            )
            .limit(1);

          if (!result.length) {
            return null;
          }

          return result[0];
        } catch (error) {
          throw fromDatabaseError(error, "Fetching proposal details");
        }
      }),
    ),
});
