import { and, count, desc, eq, like, or } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { protectedProcedure, publicProcedure } from "../../core";
import { clientSchemas } from "@pkg/schema";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";

const { clientTable, clientContactTable, workOrderTable, workOrderSiteTable } =
  schema;

export const clientQueryRouter = router({
  totalClientAndContact: protectedProcedure.query(
    handleQuery(async ({ ctx }) => {
      const clientsResult = await ctx.db
        .select({ count: count() })
        .from(clientTable);

      const contactsResult = await ctx.db
        .select({ count: count() })
        .from(clientContactTable);

      if (!clientsResult[0] || !contactsResult[0]) {
        throw throwNotFoundError("Clients and contacts");
      }

      return {
        totalClients: clientsResult[0].count,
        totalContacts: contactsResult[0].count,
      };
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

      return handleDatabaseOperation(async () => {
        return ctx.db
          .select()
          .from(clientTable)
          .where(clientQuery)
          .orderBy(desc(clientTable.created_at));
      }, "Failed to fetch clients");
    }),
  ),

  // Get a single client by ID
  getClient: publicProcedure.input(clientSchemas.getClientSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const client = await handleDatabaseOperation(async () => {
        return ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.clientId));
      }, "Failed to fetch client");

      if (client.length === 0) {
        throwNotFoundError("Client");
      }

      const clientUsers = await handleDatabaseOperation(async () => {
        return ctx.db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.client_id, input.clientId));
      }, "Failed to fetch client contacts");

      return { client: client[0], clientUsers };
    }),
  ),

  // Get client stats
  getClientStats: publicProcedure.input(clientSchemas.getClientSchema).query(
    handleQuery(async ({ input, ctx }) => {
      const workOrders = await ctx.db
        .select({ id: workOrderTable.id })
        .from(workOrderTable)
        .where(eq(workOrderTable.client_id, input.clientId));

      const workOrderIds = workOrders.map((w: any) => w.id);

      let siteCount = 0;
      let totalBudgetAmount = 0;
      let totalExpenseAmount = 0;
      let completedWorkOrders = 0;

      if (workOrderIds.length > 0) {
        const woSites = await ctx.db
          .select({ id: workOrderSiteTable.id })
          .from(workOrderSiteTable)
          .where(eq(workOrderSiteTable.work_order_id, workOrderIds[0]));

        if (workOrderIds.length > 1) {
          for (let i = 1; i < workOrderIds.length; i++) {
            const more = await ctx.db
              .select({ id: workOrderSiteTable.id })
              .from(workOrderSiteTable)
              .where(eq(workOrderSiteTable.work_order_id, workOrderIds[i]));
            woSites.push(...more);
          }
        }

        siteCount = woSites.length;

        const woRows = await ctx.db
          .select({
            status: workOrderTable.status,
            budget_amount: workOrderTable.grand_total_amount,
            expense_amount: workOrderTable.expense_amount,
          })
          .from(workOrderTable)
          .where(eq(workOrderTable.client_id, input.clientId));

        for (const row of woRows) {
          if (row.status === "completed") completedWorkOrders += 1;
          totalBudgetAmount += Number(row.budget_amount);
          totalExpenseAmount += Number(row.expense_amount);
        }
      }

      return {
        siteCount,
        completedWorkOrders,
        totalBudgetAmount,
        totalExpenseAmount,
      };
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

        return handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(clientContactTable)
            .where(contactQuery)
            .orderBy(desc(clientContactTable.id));
        }, "Failed to fetch client contacts");
      }),
    ),

  // Get contacts for a specific client
  getClientContacts: publicProcedure
    .input(clientSchemas.getClientContactsSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        return handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(clientContactTable)
            .where(eq(clientContactTable.client_id, input.clientId));
        }, "Failed to fetch client contacts");
      }),
    ),

  // Get a single contact by ID
  getClientContact: publicProcedure
    .input(clientSchemas.getClientContactSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const contact = await handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(clientContactTable)
            .where(eq(clientContactTable.id, input.clientContactId));
        }, "Failed to fetch client contact");

        if (contact.length === 0) {
          throwNotFoundError("Client contact");
        }

        return contact[0];
      }),
    ),

  // Get client with all their contacts
  getClientWithContacts: publicProcedure
    .input(clientSchemas.getClientSchema)
    .query(
      handleQuery(async ({ input, ctx }) => {
        const client = await handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(clientTable)
            .where(eq(clientTable.id, input.clientId));
        }, "Failed to fetch client");

        if (client.length === 0) {
          throwNotFoundError("Client");
        }

        const contacts = await handleDatabaseOperation(async () => {
          return ctx.db
            .select()
            .from(clientContactTable)
            .where(eq(clientContactTable.client_id, input.clientId));
        }, "Failed to fetch client contacts");

        return {
          client: client[0],
          contacts,
        };
      }),
    ),

  // Get all clients with their contacts
  getClientsWithContacts: publicProcedure.query(
    handleQuery(async ({ ctx }) => {
      const clients = await handleDatabaseOperation(async () => {
        return ctx.db.select().from(clientTable);
      }, "Failed to fetch clients");

      const allContacts = await handleDatabaseOperation(async () => {
        return ctx.db.select().from(clientContactTable);
      }, "Failed to fetch contacts");

      return clients.map((client: any) => ({
        ...client,
        contacts: allContacts.filter(
          (contact: any) => contact.client_id === client.id,
        ),
      }));
    }),
  ),
});
