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

export const userMutationRouter = router({
  // Register new user
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(input.password, 10);

      // Create user
      const [newUser] = await db
        .insert(userTable)
        .values({
          name: input.name,
          email: input.email,
          password_hash,
          contact_number: input.contact_number,
          role: input.role,
        })
        .$returningId();

      return {
        message: "User registered successfully",
        userId: newUser.id,
      };
    }),

  // Login
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    // Find user
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, input.email))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your account has been deactivated",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      input.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }),

  // Change password (authenticated users only)
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = parseInt(ctx.user.sub);

      // Get user
      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        input.currentPassword,
        user.password_hash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

      // Update password
      await db
        .update(userTable)
        .set({ password_hash: newPasswordHash })
        .where(eq(userTable.id, userId));

      return {
        message: "Password changed successfully",
      };
    }),
});
