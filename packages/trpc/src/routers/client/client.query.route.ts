import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure, publicProcedure } from "../../core";
import { clientSchemas } from "@pkg/schema";
import { notFound, fromDatabaseError } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const { clientTable, clientContactTable, workOrderTable, workOrderSiteTable } =
  schema;

export const clientQueryRouter = router({
  totalClientAndContact: protectedProcedure.query(
    handleQuery(async ({ ctx }) => {
      try {
        const clientsResult = await ctx.db
          .select({ count: count() })
          .from(clientTable);

        const contactsResult = await ctx.db
          .select({ count: count() })
          .from(clientContactTable);

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
  getClients: publicProcedure.input(clientSchemas.getAllClientsSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const { searchQuery, status } = input;

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

  getClient: publicProcedure.input(clientSchemas.getClientSchema).query(
    handleQuery(async ({ input, ctx }) => {
      try {
        const client = await ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.clientId));

        if (client.length === 0) {
          throw notFound("Client", input.clientId);
        }

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
        }

        return {
          client: client[0],
          clientUsers,
          siteCount,
          completedWorkOrders,
          totalBudgetAmount: 0,
          totalExpenseAmount: 0,
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
