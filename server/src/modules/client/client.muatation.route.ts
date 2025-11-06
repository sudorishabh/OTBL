import { router, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "../../db";
import { clientTable, clientContactTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  addClientSchema,
  editClientSchema,
  addClientContactSchema,
  editClientContactSchema,
  deleteClientContactSchema,
  deleteClientSchema,
  addClientWithContactsSchema,
} from "./client.schema";

export const clientMutationRouter = router({
  // Add a new client
  addClient: publicProcedure
    .input(addClientSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db.insert(clientTable).values(input);

        return {
          success: true,
          clientId: result[0].insertId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add client",
        });
      }
    }),

  // Add client with contacts in one transaction
  addClientWithContacts: publicProcedure
    .input(addClientWithContactsSchema)
    .mutation(async ({ input }) => {
      try {
        // Insert client
        const clientResult = await db.insert(clientTable).values(input.client);

        const clientId = clientResult[0].insertId;

        // Insert contacts if provided
        if (input.contacts && input.contacts.length > 0) {
          const contactsWithClientId = input.contacts.map((contact) => ({
            ...contact,
            client_id: clientId,
          }));

          await db.insert(clientContactTable).values(contactsWithClientId);
        }

        return {
          success: true,
          clientId,
          contactsAdded: input.contacts?.length || 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add client with contacts",
        });
      }
    }),

  // Edit an existing client
  editClient: publicProcedure
    .input(editClientSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...rest } = input;

        // Check if client exists
        const existingClient = await db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, id));

        if (existingClient.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client does not exist",
          });
        }

        // Update the client
        await db.update(clientTable).set(rest).where(eq(clientTable.id, id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit client",
        });
      }
    }),

  // Delete a client
  deleteClient: publicProcedure
    .input(deleteClientSchema)
    .mutation(async ({ input }) => {
      try {
        const existingClient = await db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.id));

        if (existingClient.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client does not exist",
          });
        }

        // Delete client (contacts will be cascade deleted)
        await db.delete(clientTable).where(eq(clientTable.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete client",
        });
      }
    }),

  // Add a new client contact
  addClientContact: publicProcedure
    .input(addClientContactSchema)
    .mutation(async ({ input }) => {
      try {
        // Verify client exists
        const client = await db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.client_id));

        if (client.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client does not exist",
          });
        }

        const result = await db.insert(clientContactTable).values(input);

        return {
          success: true,
          contactId: result[0].insertId,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add client contact",
        });
      }
    }),

  // Edit an existing client contact
  editClientContact: publicProcedure
    .input(editClientContactSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...rest } = input;

        // Check if contact exists
        const existingContact = await db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.id, id));

        if (existingContact.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client contact does not exist",
          });
        }

        // Update the contact
        await db
          .update(clientContactTable)
          .set(rest)
          .where(eq(clientContactTable.id, id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to edit client contact",
        });
      }
    }),

  // Delete a client contact
  deleteClientContact: publicProcedure
    .input(deleteClientContactSchema)
    .mutation(async ({ input }) => {
      try {
        const existingContact = await db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.id, input.id));

        if (existingContact.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client contact does not exist",
          });
        }

        await db
          .delete(clientContactTable)
          .where(eq(clientContactTable.id, input.id));

        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete client contact",
        });
      }
    }),
});
