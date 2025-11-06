// src/routers/auth.ts
import { router, publicProcedure, protectedProcedure } from "@/trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import {
  officeTable,
  workOrderTable,
  officeUserTable,
  userTable,
} from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import {
  addOfficeSchema,
  editOfficeSchema,
  assignUserToOfficeSchema,
  removeUserFromOfficeSchema,
} from "./office.schema";
import { throwNotFound, handleDatabaseOperation } from "@/utils/trpc-errors";

export const officeMutationRouter = router({
  // Public: returns JWT on valid credentials
  addOffice: publicProcedure
    .input(addOfficeSchema)
    .mutation(async ({ input }) => {
      const { manager_id, operator_ids, ...officeData } = input;

      // Insert office
      const result = await handleDatabaseOperation(
        () => db.insert(officeTable).values(officeData),
        "Failed to create office"
      );

      const officeId = result[0].insertId;

      // Assign manager if provided
      if (manager_id) {
        // Verify user exists and has appropriate role
        const [user] = await handleDatabaseOperation(
          () => db.select().from(userTable).where(eq(userTable.id, manager_id)),
          "Failed to verify manager"
        );

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Manager not found",
          });
        }

        await handleDatabaseOperation(
          () =>
            db.insert(officeUserTable).values({
              user_id: manager_id,
              office_id: officeId,
              role: "manager",
              assigned_by: null, // Set to ctx.user.sub if you have auth context
            }),
          "Failed to assign manager"
        );
      }

      // Assign operators if provided
      if (operator_ids && operator_ids.length > 0) {
        // Verify all operators exist
        const users = await handleDatabaseOperation(
          () =>
            db
              .select()
              .from(userTable)
              .where(inArray(userTable.id, operator_ids)),
          "Failed to verify operators"
        );

        if (users.length !== operator_ids.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or more operators not found",
          });
        }

        const operatorValues = operator_ids.map((operatorId) => ({
          user_id: operatorId,
          office_id: officeId,
          role: "operator" as const,
          assigned_by: null, // Set to ctx.user.sub if you have auth context
        }));

        await handleDatabaseOperation(
          () => db.insert(officeUserTable).values(operatorValues),
          "Failed to assign operators"
        );
      }

      return {
        success: true,
        officeId,
      };
    }),

  editOffice: publicProcedure
    .input(editOfficeSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;

      // Check if office exists
      const existingOffice = await handleDatabaseOperation(
        () => db.select().from(officeTable).where(eq(officeTable.id, id)),
        "Failed to check office existence"
      );

      if (existingOffice.length === 0) {
        throwNotFound("Office");
      }

      // Update the office
      await handleDatabaseOperation(
        () => db.update(officeTable).set(rest).where(eq(officeTable.id, id)),
        "Failed to update office"
      );

      return {
        success: true,
      };
    }),

  assignUserToOffice: publicProcedure
    .input(assignUserToOfficeSchema)
    .mutation(async ({ input }) => {
      const { office_id, user_id, role } = input;

      // Verify office exists
      const [office] = await handleDatabaseOperation(
        () =>
          db.select().from(officeTable).where(eq(officeTable.id, office_id)),
        "Failed to verify office"
      );

      if (!office) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Office not found",
        });
      }

      // Verify user exists
      const [user] = await handleDatabaseOperation(
        () => db.select().from(userTable).where(eq(userTable.id, user_id)),
        "Failed to verify user"
      );

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // If assigning as manager, check if office already has a manager
      if (role === "manager") {
        const existingManagers = await db
          .select()
          .from(officeUserTable)
          .where(
            and(
              eq(officeUserTable.office_id, office_id),
              eq(officeUserTable.role, "manager")
            )
          );

        if (existingManagers.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Office already has a manager. Please remove the existing manager first.",
          });
        }
      }

      // Check if user is already assigned to this office
      const existingAssignments = await db
        .select()
        .from(officeUserTable)
        .where(
          and(
            eq(officeUserTable.office_id, office_id),
            eq(officeUserTable.user_id, user_id)
          )
        );

      if (existingAssignments.length > 0) {
        // Update the role if already assigned
        await handleDatabaseOperation(
          () =>
            db
              .update(officeUserTable)
              .set({ role })
              .where(eq(officeUserTable.id, existingAssignments[0].id)),
          "Failed to update user role"
        );
      } else {
        // Create new assignment
        await handleDatabaseOperation(
          () =>
            db.insert(officeUserTable).values({
              user_id,
              office_id,
              role,
              assigned_by: null, // Set to ctx.user.sub if you have auth context
            }),
          "Failed to assign user"
        );
      }

      return {
        success: true,
      };
    }),

  removeUserFromOffice: publicProcedure
    .input(removeUserFromOfficeSchema)
    .mutation(async ({ input }) => {
      const { office_id, user_id } = input;

      // Check if assignment exists
      const assignments = await db
        .select()
        .from(officeUserTable)
        .where(
          and(
            eq(officeUserTable.office_id, office_id),
            eq(officeUserTable.user_id, user_id)
          )
        );

      if (assignments.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User assignment not found",
        });
      }

      // Remove the assignment
      await handleDatabaseOperation(
        () =>
          db
            .delete(officeUserTable)
            .where(eq(officeUserTable.id, assignments[0].id)),
        "Failed to remove user assignment"
      );

      return {
        success: true,
      };
    }),

  // Protected: only accessible with valid Bearer token
  //   me: protectedProcedure.query(({ ctx }) => {
  //     return { userId: ctx.user!.sub, email: ctx.user!.email ?? null };
  //   }),
});
