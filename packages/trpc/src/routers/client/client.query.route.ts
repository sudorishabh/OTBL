import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure, publicProcedure } from "../../core";
import {
  assertCanAccessClient,
  clientIdsVisibleToScope,
  getAccessScope,
} from "../../access-scope";
import { clientSchemas } from "@pkg/schema";
import { notFound, fromDatabaseError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const { 
  clientTable, 
  clientContactTable, 
  workOrderTable, 
  workOrderSiteTable,
  scheduleOfRatesTable,
  cleaningUpSoilAreaTable,
  liftingRecoveryOilSlushTable,
  excavationContSoilTable,
  transportationContSoilTable,
  refillingExcavatedContSoilTable,
  bioremediationContSoilTable
} = schema;

export const clientQueryRouter = router({
  totalClientAndContact: protectedProcedure.query(
    handleQuery(async ({ ctx }) => {
      try {
        const scope = await getAccessScope(
          ctx.db,
          Number(ctx.user!.sub),
          ctx.user!.role,
        );
        const clientIds = await clientIdsVisibleToScope(ctx.db, scope);

        if (scope.kind === "restricted" && (!clientIds || clientIds.length === 0)) {
          return { totalClients: 0, totalContacts: 0 };
        }

        const clientWhere =
          scope.kind === "full"
            ? undefined
            : clientIds && clientIds.length > 0
              ? inArray(clientTable.id, clientIds)
              : eq(clientTable.id, -1);

        const clientsResult = await ctx.db
          .select({ count: count() })
          .from(clientTable)
          .where(clientWhere);

        const contactWhere =
          scope.kind === "full"
            ? undefined
            : clientIds && clientIds.length > 0
              ? inArray(clientContactTable.client_id, clientIds)
              : eq(clientContactTable.client_id, -1);

        const contactsResult = await ctx.db
          .select({ count: count() })
          .from(clientContactTable)
          .where(contactWhere);

        return {
          totalClients: clientsResult[0]?.count ?? 0,
          totalContacts: contactsResult[0]?.count ?? 0,
        };
      } catch (error) {
        throw fromDatabaseError(error, "Fetching client and contact counts");
      }
    }),
  ),

  // Get all clients with pagination, search, and filters
  getClients: protectedProcedure.input(clientSchemas.getAllClientsSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { searchQuery, status } = input;

      const scope = await getAccessScope(
        ctx.db,
        Number(ctx.user!.sub),
        ctx.user!.role,
      );
      const clientIds = await clientIdsVisibleToScope(ctx.db, scope);

      let clientQuery = undefined;

      if (status && status !== "all") {
        clientQuery = eq(clientTable.status, status);
      }

      if (searchQuery && searchQuery.trim() !== "") {
        const searchCondition = or(
          like(clientTable.name, `%${searchQuery}%`),
          like(clientTable.email, `%${searchQuery}%`),
          like(clientTable.gst_number, `%${searchQuery}%`),
          like(clientTable.city, `%${searchQuery}%`),
          like(clientTable.contact_number, `%${searchQuery}%`),
        );
        clientQuery = clientQuery
          ? and(clientQuery, searchCondition)
          : searchCondition;
      }

      if (scope.kind === "restricted") {
        const scopeFilter =
          clientIds && clientIds.length > 0
            ? inArray(clientTable.id, clientIds)
            : eq(clientTable.id, -1);
        clientQuery = clientQuery
          ? and(clientQuery, scopeFilter)
          : scopeFilter;
      }

      try {
        return await ctx.db
          .select()
          .from(clientTable)
          .where(clientQuery)
          .orderBy(desc(clientTable.created_at));
      } catch (error) {
        throw fromDatabaseError(error, "Fetching clients");
      }
    }),
  ),

  getClient: protectedProcedure.input(clientSchemas.getClientSchema).query(
    handleQuery(async ({ input, ctx }) => {
      try {
        const scope = await getAccessScope(
          ctx.db,
          Number(ctx.user!.sub),
          ctx.user!.role,
        );

        const client = await ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.clientId));

        if (client.length === 0) {
          throw notFound("Client", input.clientId);
        }

        await assertCanAccessClient(ctx.db, scope, input.clientId);

        const clientUsers = await ctx.db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.client_id, input.clientId));

        const workOrders = await ctx.db
          .select({ id: workOrderTable.id, status: workOrderTable.status })
          .from(workOrderTable)
          .where(eq(workOrderTable.client_id, input.clientId));

        const workOrderIds = workOrders.map((w) => w.id);

        let siteCount = 0;
        let completedWorkOrders = 0;
        let totalBudgetAmount = 0;
        let totalExpenseAmount = 0;

        if (workOrderIds.length > 0) {
          const woSites = await ctx.db
            .select({ id: workOrderSiteTable.id })
            .from(workOrderSiteTable)
            .where(inArray(workOrderSiteTable.work_order_id, workOrderIds));

          siteCount = woSites.length;

          // Count completed work orders
          completedWorkOrders = workOrders.filter(
            (wo) => wo.status === "completed",
          ).length;

          const sors = await ctx.db
            .select({ total_cost: scheduleOfRatesTable.total_cost })
            .from(scheduleOfRatesTable)
            .where(inArray(scheduleOfRatesTable.work_order_id, workOrderIds));
            
          totalBudgetAmount = sors.reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);

          if (woSites.length > 0) {
            const woSiteIds = woSites.map(s => s.id);
            const [
              cleanSoilAreaExp,
              liftingOilExp,
              excavSoilExp,
              transSoilExp,
              refillSoilExp,
              bioremSoilExp,
            ] = await Promise.all([
              ctx.db
                .select({ amount: cleaningUpSoilAreaTable.amount })
                .from(cleaningUpSoilAreaTable)
                .where(
                  and(
                    inArray(cleaningUpSoilAreaTable.work_order_site_id, woSiteIds),
                    eq(cleaningUpSoilAreaTable.type, "completion" as any)
                  )
                ),
              ctx.db
                .select({ amount: liftingRecoveryOilSlushTable.amount })
                .from(liftingRecoveryOilSlushTable)
                .where(
                  and(
                    inArray(liftingRecoveryOilSlushTable.work_order_site_id, woSiteIds),
                    eq(liftingRecoveryOilSlushTable.type, "completion" as any)
                  )
                ),
              ctx.db
                .select({ amount: excavationContSoilTable.amount })
                .from(excavationContSoilTable)
                .where(
                  and(
                    inArray(excavationContSoilTable.work_order_site_id, woSiteIds),
                    eq(excavationContSoilTable.type, "completion" as any)
                  )
                ),
              ctx.db
                .select({ amount: transportationContSoilTable.amount })
                .from(transportationContSoilTable)
                .where(
                  and(
                    inArray(transportationContSoilTable.work_order_site_id, woSiteIds),
                    eq(transportationContSoilTable.type, "completion" as any)
                  )
                ),
              ctx.db
                .select({ amount: refillingExcavatedContSoilTable.amount })
                .from(refillingExcavatedContSoilTable)
                .where(
                  and(
                    inArray(refillingExcavatedContSoilTable.work_order_site_id, woSiteIds),
                    eq(refillingExcavatedContSoilTable.type, "completion" as any)
                  )
                ),
              ctx.db
                .select({ amount: bioremediationContSoilTable.amount })
                .from(bioremediationContSoilTable)
                .where(
                  and(
                    inArray(bioremediationContSoilTable.work_order_site_id, woSiteIds),
                    eq(bioremediationContSoilTable.type, "completion" as any)
                  )
                ),
            ]);

            const allAmounts = [
              ...cleanSoilAreaExp,
              ...liftingOilExp,
              ...excavSoilExp,
              ...transSoilExp,
              ...refillSoilExp,
              ...bioremSoilExp,
            ];

            totalExpenseAmount = allAmounts.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          }
        }

        return {
          client: client[0],
          clientUsers,
          siteCount,
          completedWorkOrders,
          totalBudgetAmount,
          totalExpenseAmount,
        };
      } catch (error) {
        // Re-throw AppError instances (like notFound)
        if (error && typeof error === "object" && "errorCode" in error) {
          throw error;
        }
        throw fromDatabaseError(error, "Fetching client details");
      }
    }),
  ),

  // Get all client contacts with pagination, search, and filters
  getAllClientContacts: publicProcedure
    .input(clientSchemas.getAllClientContactsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const { searchQuery, clientId } = input;

        let contactQuery = undefined;

        if (clientId && clientId !== "all") {
          contactQuery = eq(clientContactTable.client_id, parseInt(clientId));
        }

        if (searchQuery && searchQuery.trim() !== "") {
          const searchCondition = or(
            like(clientContactTable.name, `%${searchQuery}%`),
            like(clientContactTable.email, `%${searchQuery}%`),
            like(clientContactTable.contact_number, `%${searchQuery}%`),
            like(clientContactTable.designation, `%${searchQuery}%`),
          );
          contactQuery = contactQuery
            ? and(contactQuery, searchCondition)
            : searchCondition;
        }

        try {
          return await ctx.db
            .select()
            .from(clientContactTable)
            .where(contactQuery)
            .orderBy(desc(clientContactTable.id));
        } catch (error) {
          throw fromDatabaseError(error, "Fetching client contacts");
        }
      }),
    ),

  // Get contacts for a specific client
  getClientContacts: publicProcedure
    .input(clientSchemas.getClientContactsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        try {
          return await ctx.db
            .select()
            .from(clientContactTable)
            .where(eq(clientContactTable.client_id, input.clientId));
        } catch (error) {
          throw fromDatabaseError(error, "Fetching client contacts");
        }
      }),
    ),

  // Get a single contact by ID
  getClientContact: publicProcedure
    .input(clientSchemas.getClientContactSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        try {
          const contact = await ctx.db
            .select()
            .from(clientContactTable)
            .where(eq(clientContactTable.id, input.clientContactId));

          if (contact.length === 0) {
            throw notFound("Client contact", input.clientContactId);
          }

          return contact[0];
        } catch (error) {
          // Re-throw AppError instances
          if (error && typeof error === "object" && "errorCode" in error) {
            throw error;
          }
          throw fromDatabaseError(error, "Fetching client contact");
        }
      }),
    ),

  // Get client with all their contacts
  getClientWithContacts: publicProcedure
    .input(clientSchemas.getClientSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        try {
          const client = await ctx.db
            .select()
            .from(clientTable)
            .where(eq(clientTable.id, input.clientId));

          if (client.length === 0) {
            throw notFound("Client", input.clientId);
          }

          const contacts = await ctx.db
            .select()
            .from(clientContactTable)
            .where(eq(clientContactTable.client_id, input.clientId));

          return {
            client: client[0],
            contacts,
          };
        } catch (error) {
          // Re-throw AppError instances
          if (error && typeof error === "object" && "errorCode" in error) {
            throw error;
          }
          throw fromDatabaseError(error, "Fetching client with contacts");
        }
      }),
    ),

  // Get all clients with their contacts
  getClientsWithContacts: publicProcedure.query(
    handleQuery(async ({ ctx }) => {
      try {
        const clients = await ctx.db.select().from(clientTable);

        const allContacts = await ctx.db.select().from(clientContactTable);

        return clients.map((client: any) => ({
          ...client,
          contacts: allContacts.filter(
            (contact: any) => contact.client_id === client.id,
          ),
        }));
      } catch (error) {
        throw fromDatabaseError(error, "Fetching clients with contacts");
      }
    }),
  ),
});
