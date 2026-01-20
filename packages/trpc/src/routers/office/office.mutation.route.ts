import { and, eq, inArray } from "drizzle-orm";
import { schema } from "@pkg/db";
import { constants } from "@pkg/utils";
import { router } from "../../trpc";
import { adminProcedure, managerProcedure } from "../../middleware";
import { officeSchemas } from "@pkg/schema";
import {
  throwNotFoundError,
  throwValidationError,
  handleDatabaseOperation,
} from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const { officeTable, officeUserTable, userTable } = schema;
const { ROLES } = constants;

export const officeMutationRouter = router({
  createOffice: adminProcedure.input(officeSchemas.createOfficeSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { manager_id, operator_ids, ...officeData } = input;
      const userId = parseInt(ctx.user!.sub);

      const { officeId } = await ctx.db.transaction(async (tx) => {
        const result = await tx.insert(officeTable).values(officeData);
        const officeId = result[0].insertId;

        if (manager_id) {
          const [user] = await tx
            .select()
            .from(userTable)
            .where(eq(userTable.id, manager_id));

          if (!user) {
            throwNotFoundError("Manager", manager_id);
          }
          await tx.insert(officeUserTable).values({
            user_id: manager_id,
            office_id: officeId,
            role: ROLES.MANAGER as "manager",
            assigned_by: userId,
          });
        }

        if (operator_ids && operator_ids.length > 0) {
          const users = await tx
            .select()
            .from(userTable)
            .where(inArray(userTable.id, operator_ids));

          if (users.length !== operator_ids.length) {
            throwNotFoundError("Operator");
          }

          const operatorValues = operator_ids.map((operatorId: number) => ({
            user_id: operatorId,
            office_id: officeId,
            role: "operator" as const,
            assigned_by: userId,
          }));

          await tx.insert(officeUserTable).values(operatorValues);
        }

        return { officeId };
      });

      return {
        success: true,
        officeId,
      };
    }),
  ),

  updateOffice: managerProcedure
    .input(officeSchemas.updateOfficeSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;

        const existingOffice = await ctx.db
          .select()
          .from(officeTable)
          .where(eq(officeTable.id, id));

        if (existingOffice.length === 0) {
          throwNotFoundError("Office", id);
        }

        await handleDatabaseOperation(
          () =>
            ctx.db.update(officeTable).set(rest).where(eq(officeTable.id, id)),
          "Failed to update office",
        );

        return { success: true };
      }),
    ),

  assignUserToOffice: managerProcedure
    .input(officeSchemas.assignUserToOfficeSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { office_id, user_id, role } = input;
        const userId = parseInt(ctx.user!.sub);

        // Verify office exists
        const [office] = await ctx.db
          .select()
          .from(officeTable)
          .where(eq(officeTable.id, office_id));

        if (!office) {
          throwNotFoundError("Office", office_id);
        }

        // Verify user exists
        const [user] = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.id, user_id));

        if (!user) {
          throwNotFoundError("User", user_id);
        }

        // If assigning as manager, check if office already has a manager
        if (role === ROLES.MANAGER) {
          const existingManagers = await ctx.db
            .select()
            .from(officeUserTable)
            .where(
              and(
                eq(officeUserTable.office_id, office_id),
                eq(officeUserTable.role, ROLES.MANAGER),
              ),
            );

          if (existingManagers.length > 0) {
            throwValidationError(
              "Office already has a manager. Please remove the existing manager first.",
            );
          }
        }

        // Check if user is already assigned to this office
        const [existingAssignments] = await ctx.db
          .select()
          .from(officeUserTable)
          .where(
            and(
              eq(officeUserTable.office_id, office_id),
              eq(officeUserTable.user_id, user_id),
            ),
          )
          .limit(1);

        if (existingAssignments) {
          // Update the role if already assigned
          await ctx.db
            .update(officeUserTable)
            .set({ role })
            .where(eq(officeUserTable.id, existingAssignments.id));
        } else {
          // Create new assignment
          await ctx.db.insert(officeUserTable).values({
            user_id,
            office_id,
            role,
            assigned_by: userId,
          });
        }

        return { success: true };
      }),
    ),

  removeUserFromOffice: managerProcedure
    .input(officeSchemas.expelUserFromOfficeSchema)
    .mutation(
      handleMutation(async ({ input, ctx }) => {
        const { office_id, user_id } = input;

        const assignments = await ctx.db
          .select()
          .from(officeUserTable)
          .where(
            and(
              eq(officeUserTable.office_id, office_id),
              eq(officeUserTable.user_id, user_id),
            ),
          );

        if (!assignments[0]) {
          throwNotFoundError("User assignment");
        }

        await ctx.db
          .delete(officeUserTable)
          .where(eq(officeUserTable.id, assignments[0].id));

        return { success: true };
      }),
    ),
});
