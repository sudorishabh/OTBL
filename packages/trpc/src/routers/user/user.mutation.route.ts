import { eq } from "drizzle-orm";
import { schema } from "@pkg/db";
import { hashPassword, USER_ROLES, verifyPassword } from "@pkg/auth";
import { adminProcedure, protectedProcedure } from "../../middleware";
import { router } from "../../trpc";
import {
  throwNotFoundError,
  throwUnauthorizedError,
  throwConflictError,
  throwForbiddenError,
  handleDatabaseOperation,
} from "../../errors";
import { handleProtectedMutation } from "../../helper/typed-handler";
import { userSchemas } from "@pkg/schema";

const { userTable } = schema;

export const userMutationRouter = router({
  createUserByAdmin: adminProcedure
    .input(userSchemas.createUserSchema)
    .mutation(
      handleProtectedMutation(async ({ input, ctx }) => {
        const existingUser = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.email, input.email));

        if (existingUser.length > 0) {
          throwConflictError("User with this email already exists");
        }

        // Hash the password before storing
        const hashedPassword = await hashPassword(input.password);

        await handleDatabaseOperation(
          () =>
            ctx.db.insert(userTable).values({
              ...input,
              password: hashedPassword,
            }),
          "Failed to create new user",
        );

        return {
          success: true,
          message: "User created successfully",
        };
      }),
    ),

  updateUserByAdmin: protectedProcedure
    .input(userSchemas.updateUserSchema)
    .mutation(
      handleProtectedMutation(async ({ input, ctx }) => {
        const { id, password, ...rest } = input;

        const existingUser = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.id, id));

        if (existingUser.length === 0) {
          throwNotFoundError("User");
        }

        const isAdmin = ctx.user.role === USER_ROLES.ADMIN;
        const isOwnProfile = ctx.user.sub === id.toString();

        if (!isAdmin && !isOwnProfile) {
          throwForbiddenError("You can only edit your own profile");
        }

        // Prepare update data
        const updateData: Record<string, any> = { ...rest };

        // Hash password if provided
        if (password) {
          updateData.password = await hashPassword(password);
        }

        await ctx.db
          .update(userTable)
          .set(updateData)
          .where(eq(userTable.id, id));

        return {
          success: true,
          message: "User updated successfully",
        };
      }),
    ),

  updateUserPassword: protectedProcedure
    .input(userSchemas.updateUserPasswordSchema)
    .mutation(
      handleProtectedMutation(async ({ input, ctx }) => {
        const userId = parseInt(ctx.user.sub);
        const users = await ctx.db
          .select({
            id: userTable.id,
            password: userTable.password,
          })
          .from(userTable)
          .where(eq(userTable.id, userId));

        if (!users[0] || users.length === 0) {
          throwNotFoundError("User");
        }

        const userData = users[0];

        const isCurrentPasswordValid = await verifyPassword(
          input.currentPassword,
          userData.password,
        );

        if (!isCurrentPasswordValid) {
          throwUnauthorizedError("Current password is incorrect");
        }

        const hashedNewPassword = await hashPassword(input.newPassword);

        await ctx.db
          .update(userTable)
          .set({ password: hashedNewPassword })
          .where(eq(userTable.id, userId));

        return {
          success: true,
          message: "Password changed successfully",
        };
      }),
    ),
});
