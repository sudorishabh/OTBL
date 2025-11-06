import { router, publicProcedure, protectedProcedure } from "../../trpc";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  editUserSchema,
} from "./user.schema";
import { db } from "../../db";
import { userTable } from "../../db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { signToken, signRefreshToken } from "../../utils/jwt";
import { hasRole } from "@/middlewares/authorization";
import { handleDatabaseOperation } from "@/utils/trpc-errors";

export const userMutationRouter = router({
  // Register new user
  registerByAdmin: protectedProcedure
    .use(hasRole("admin"))
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, email, password, role, contact_number } = input;

      const existingUser = await handleDatabaseOperation(
        () => db.select().from(userTable).where(eq(userTable.email, email)),
        "Failed to check existing user"
      );

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // const hashSaltRounds = 12;
      // const hashedPassword = await bcrypt.hash(password, hashSaltRounds);

      await handleDatabaseOperation(
        () =>
          db.insert(userTable).values({
            name,
            email,
            password,
            role,
            contact_number,
          }),
        "Failed to create new user"
      );

      return {
        success: true,
      };
    }),

  editUser: protectedProcedure
    .input(editUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, name, email, password, role } = input;

      const existingUser = await handleDatabaseOperation(
        () => db.select().from(userTable).where(eq(userTable.id, +id)),
        "Failed to check existing user"
      );

      if (existingUser.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const updates = {
        name,
        email,
        role,
        password,
      };

      await handleDatabaseOperation(
        () =>
          db
            .update(userTable)
            .set(updates)
            .where(eq(userTable.id, Number(id))),
        "Failed to update user"
      );

      return {
        success: true,
      };
    }),
});
