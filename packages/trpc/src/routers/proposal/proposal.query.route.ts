import { and, count, desc, eq, like, or } from "drizzle-orm";
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

  // Get proposals for a specific client with pagination
  getProposalsByClientPaginated: publicProcedure
    .input(proposalSchemas.getProposalsByClientPaginatedSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { client_id, page, limit, searchQuery } = input;

        let conditions: any = eq(proposalTable.client_id, client_id);

        if (searchQuery && searchQuery.trim() !== "") {
          conditions = and(
            conditions,
            or(
              like(proposalTable.code, `%${searchQuery}%`),
              like(proposalTable.title, `%${searchQuery}%`),
            ),
          );
        }

        try {
          const [totalResult] = await ctx.db
            .select({ count: count() })
            .from(proposalTable)
            .where(conditions);

          const total = totalResult?.count ?? 0;

          if (total === 0) {
            return {
              proposals: [],
              pagination: {
                page,
                limit,
                total,
                hasMore: false,
                totalPages: 0,
              },
            };
          }

          const offset = (page - 1) * limit;

          const proposals = await ctx.db
            .select({ proposal: proposalTable, workOrder: workOrderTable })
            .from(proposalTable)
            .leftJoin(
              workOrderTable,
              eq(workOrderTable.proposal_id, proposalTable.id),
            )
            .where(conditions)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(proposalTable.created_at));

          const totalPages = Math.ceil(total / limit);
          const hasMore = offset + proposals.length < total;

          return {
            proposals,
            pagination: {
              page,
              limit,
              total,
              hasMore,
              totalPages,
            },
          };
        } catch (error) {
          throw fromDatabaseError(error, "Fetching paginated proposals");
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
