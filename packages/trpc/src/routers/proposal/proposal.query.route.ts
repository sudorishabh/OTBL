import { desc, eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { publicProcedure } from "../../core";
import { getProposalsByClientSchema } from "./proposal.schema";
import { handleDatabaseOperation } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const { proposalTable, workOrderTable } = schema;

export const proposalQueryRouter = router({
  // Get proposals for a specific client (no pagination)
  getProposalsByClient: publicProcedure.input(getProposalsByClientSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { client_id } = input;

      const proposals = await handleDatabaseOperation(async () => {
        return ctx.db
          .select({ proposal: proposalTable, workOrder: workOrderTable })
          .from(proposalTable)
          .where(eq(proposalTable.client_id, client_id))
          .leftJoin(
            workOrderTable,
            eq(workOrderTable.proposal_id, proposalTable.id)
          )
          .orderBy(desc(proposalTable.created_at));
      }, "Failed to fetch proposals");

      return { proposals };
    })
  ),
});
