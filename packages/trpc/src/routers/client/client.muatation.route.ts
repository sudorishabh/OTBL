import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { router } from "../../trpc";
import { adminProcedure } from "../../middleware";
import { clientSchemas } from "@pkg/schema";
import { throwNotFoundError, handleDatabaseOperation } from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const { clientTable, clientContactTable } = schema;

export const clientMutationRouter = router({
  createClient: adminProcedure.input(clientSchemas.createClientSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const result = await handleDatabaseOperation(async () => {
        return ctx.db.insert(clientTable).values(input);
      }, "Failed to add client");

      return {
        success: true,
        clientId: result[0].insertId,
      };
    }),
  ),

  createClientWithContacts: adminProcedure
    .input(clientSchemas.createClientWithContactsSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const clientResult = await handleDatabaseOperation(async () => {
          return ctx.db.insert(clientTable).values(input.client);
        }, "Failed to add client");

        const clientId = clientResult[0].insertId;

        if (input.contacts && input.contacts.length > 0) {
          const contactsWithClientId = input.contacts.map((contact) => ({
            ...contact,
            client_id: clientId,
          }));

          await handleDatabaseOperation(async () => {
            return ctx.db
              .insert(clientContactTable)
              .values(contactsWithClientId);
          }, "Failed to add contacts");
        }

        return {
          success: true,
          clientId,
          contactsAdded: input.contacts?.length || 0,
        };
      }),
    ),

  updateClient: adminProcedure.input(clientSchemas.updateClientSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;

      const existingClient = await ctx.db
        .select()
        .from(clientTable)
        .where(eq(clientTable.id, id));

      if (existingClient.length === 0) {
        throwNotFoundError("Client");
      }

      await handleDatabaseOperation(async () => {
        return ctx.db
          .update(clientTable)
          .set(rest)
          .where(eq(clientTable.id, id));
      }, "Failed to edit client");

      return { success: true };
    }),
  ),

  deleteClient: adminProcedure.input(clientSchemas.deleteClientSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const existingClient = await ctx.db
        .select()
        .from(clientTable)
        .where(eq(clientTable.id, input.clientId));

      if (existingClient.length === 0) {
        throwNotFoundError("Client");
      }

      await handleDatabaseOperation(async () => {
        return ctx.db
          .delete(clientTable)
          .where(eq(clientTable.id, input.clientId));
      }, "Failed to delete client");

      return { success: true };
    }),
  ),

  createClientContact: adminProcedure
    .input(clientSchemas.createClientContactSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        // Verify client exists
        const client = await ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, input.client_id));

        if (client.length === 0) {
          throwNotFoundError("Client");
        }

        const result = await handleDatabaseOperation(async () => {
          return ctx.db.insert(clientContactTable).values(input);
        }, "Failed to add client contact");

        return {
          success: true,
          contactId: result[0].insertId,
        };
      }),
    ),

  updateClientContact: adminProcedure
    .input(clientSchemas.updateClientContactSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;

        const existingContact = await ctx.db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.id, id));

        if (existingContact.length === 0) {
          throwNotFoundError("Client contact");
        }

        await handleDatabaseOperation(async () => {
          return ctx.db
            .update(clientContactTable)
            .set(rest)
            .where(eq(clientContactTable.id, id));
        }, "Failed to edit client contact");

        return { success: true };
      }),
    ),

  deleteClientContact: adminProcedure
    .input(clientSchemas.deleteClientContactSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const existingContact = await ctx.db
          .select()
          .from(clientContactTable)
          .where(eq(clientContactTable.id, input.clientContactId));

        if (existingContact.length === 0) {
          throwNotFoundError("Client contact");
        }

        await handleDatabaseOperation(async () => {
          return ctx.db
            .delete(clientContactTable)
            .where(eq(clientContactTable.id, input.clientContactId));
        }, "Failed to delete client contact");

        return { success: true };
      }),
    ),

  updateClientWithContacts: adminProcedure
    .input(clientSchemas.updateClientWithContactsSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { clientId, client, contactsToAdd, contactsToRemove } = input;

        const existingClient = await ctx.db
          .select()
          .from(clientTable)
          .where(eq(clientTable.id, clientId));

        if (existingClient.length === 0) {
          throwNotFoundError("Client");
        }

        // Update client if there are changes
        if (Object.keys(client).length > 0) {
          await handleDatabaseOperation(async () => {
            return ctx.db
              .update(clientTable)
              .set(client)
              .where(eq(clientTable.id, clientId));
          }, "Failed to update client");
        }

        // Remove contacts if specified
        if (contactsToRemove && contactsToRemove.length > 0) {
          for (const contactId of contactsToRemove) {
            await ctx.db
              .delete(clientContactTable)
              .where(eq(clientContactTable.id, contactId));
          }
        }

        // Add new contacts if specified
        if (contactsToAdd && contactsToAdd.length > 0) {
          const contactsWithClientId = contactsToAdd.map((contact) => ({
            ...contact,
            client_id: clientId,
          }));

          await handleDatabaseOperation(async () => {
            return ctx.db
              .insert(clientContactTable)
              .values(contactsWithClientId);
          }, "Failed to add contacts");
        }

        return {
          success: true,
          clientId,
          contactsAdded: contactsToAdd?.length || 0,
          contactsRemoved: contactsToRemove?.length || 0,
        };
      }),
    ),
});
