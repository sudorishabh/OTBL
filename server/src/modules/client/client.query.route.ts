import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { clientTable, clientContactTable } from "../../db/schema";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import {
  getClientSchema,
  getClientContactSchema,
  getClientContactsSchema,
  getAllClientsPaginatedSchema,
  getAllClientContactsPaginatedSchema,
} from "./client.schema";
import { handleDatabaseOperation } from "@/utils/trpc-errors";

export const clientQueryRouter = router({
  // Get all clients with pagination, search, and filters
  getClients: publicProcedure
    .input(getAllClientsPaginatedSchema)
    .query(async ({ input }) => {
      const { page, limit, searchQuery, status } = input;

      // Build the query conditions
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
          like(clientTable.contact_number, `%${searchQuery}%`)
        );
        clientQuery = clientQuery
          ? and(clientQuery, searchCondition)
          : searchCondition;
      }

      // Count total after applying filters
      const [totalResult] = await handleDatabaseOperation(() =>
        db.select({ count: count() }).from(clientTable).where(clientQuery)
      );
      const total = totalResult.count;

      if (total === 0) {
        return {
          clients: [],
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

      const clients = await handleDatabaseOperation(() =>
        db
          .select()
          .from(clientTable)
          .where(clientQuery)
          .limit(limit)
          .offset(offset)
          .orderBy(desc(clientTable.created_at))
      );

      const totalPages = Math.ceil(total / limit);
      const hasMore = offset + clients.length < total;

      return {
        clients,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages,
        },
      };
    }),

  // Get a single client by ID
  getClient: publicProcedure.input(getClientSchema).query(async ({ input }) => {
    try {
      const client = await db
        .select()
        .from(clientTable)
        .where(eq(clientTable.id, input.id));

      if (client.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return client[0];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch client",
      });
    }
  }),

  // Get all client contacts with pagination, search, and filters
  getAllClientContacts: publicProcedure
    .input(getAllClientContactsPaginatedSchema)
    .query(async ({ input }) => {
      const { page, limit, searchQuery, clientId } = input;

      // Build the query conditions
      let contactQuery = undefined;

      if (clientId && clientId !== "all") {
        contactQuery = eq(clientContactTable.client_id, parseInt(clientId));
      }

      if (searchQuery && searchQuery.trim() !== "") {
        const searchCondition = or(
          like(clientContactTable.name, `%${searchQuery}%`),
          like(clientContactTable.email, `%${searchQuery}%`),
          like(clientContactTable.contact_number, `%${searchQuery}%`),
          like(clientContactTable.designation, `%${searchQuery}%`)
        );
        contactQuery = contactQuery
          ? and(contactQuery, searchCondition)
          : searchCondition;
      }

      // Count total after applying filters
      const [totalResult] = await handleDatabaseOperation(() =>
        db
          .select({ count: count() })
          .from(clientContactTable)
          .where(contactQuery)
      );
      const total = totalResult.count;

      if (total === 0) {
        return {
          contacts: [],
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

      const contacts = await handleDatabaseOperation(() =>
        db
          .select()
          .from(clientContactTable)
          .where(contactQuery)
          .limit(limit)
          .offset(offset)
          .orderBy(desc(clientContactTable.id))
      );

      const totalPages = Math.ceil(total / limit);
      const hasMore = offset + contacts.length < total;

      return {
        contacts,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages,
        },
      };
    }),

  // Get contacts for a specific client
  getClientContacts: publicProcedure
    .input(getClientContactsSchema)
    .query(async ({ input }) => {
      try {
        const contacts = await db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.client_id, input.client_id));

        return contacts;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch client contacts",
        });
      }
    }),

  // Get a single contact by ID
  getClientContact: publicProcedure
    .input(getClientContactSchema)
    .query(async ({ input }) => {
      try {
        const contact = await db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.id, input.id));

        if (contact.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client contact not found",
          });
        }

        return contact[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch client contact",
        });
      }
    }),

  // Get client with all their contacts
  getClientWithContacts: publicProcedure
    .input(getClientSchema)
    .query(async ({ input }) => {
      try {
        // Get client
        const client = await db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.id));

        if (client.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client not found",
          });
        }

        // Get contacts
        const contacts = await db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.client_id, input.id));

        return {
          client: client[0],
          contacts,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch client with contacts",
        });
      }
    }),

  // Get all clients with their contacts
  getClientsWithContacts: publicProcedure.query(async () => {
    try {
      const clients = await db.select().from(clientTable);
      const allContacts = await db.select().from(clientContactTable);

      // Group contacts by client_id
      const clientsWithContacts = clients.map((client) => ({
        ...client,
        contacts: allContacts.filter(
          (contact) => contact.client_id === client.id
        ),
      }));

      return clientsWithContacts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch clients with contacts",
      });
    }
  }),
});
