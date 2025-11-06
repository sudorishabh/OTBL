import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { clientTable, clientContactTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  getClientSchema,
  getClientContactSchema,
  getClientContactsSchema,
} from "./client.schema";

export const clientQueryRouter = router({
  // Get all clients
  getClients: publicProcedure.query(async () => {
    try {
      const clients = await db.select().from(clientTable);
      return clients;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch clients",
      });
    }
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

  // Get all client contacts
  getAllClientContacts: publicProcedure.query(async () => {
    try {
      const contacts = await db.select().from(clientContactTable);
      return contacts;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch client contacts",
      });
    }
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
