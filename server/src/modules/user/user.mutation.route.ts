import { router, publicProcedure, protectedProcedure } from "../../trpc";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
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
      const { name, email, password, role } = input;

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

      const hashSaltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, hashSaltRounds);

      await handleDatabaseOperation(
        () =>
          db.insert(userTable).values({
            name,
            email,
            password_hash: hashedPassword,
            role,
          }),
        "Failed to create new user"
      );

      return {
        success: true,
      };
    }),
});
