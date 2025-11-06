import { protectedProcedure, router, publicProcedure } from "@/trpc";
import { loginSchema } from "./auth.schema";
import {
  handleDatabaseOperation,
  throwUnauthorized,
} from "@/utils/trpc-errors";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { signToken, signRefreshToken } from "@/utils/jwt";
import {
  setAuthenticationCookies,
  clearAuthenticationCookies,
} from "@/utils/cookie";
import { register } from "module";

export const authMutationRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    const existingUser = await handleDatabaseOperation(
      () =>
        db
          .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            role: userTable.role,
            status: userTable.status,
            password: userTable.password,
          })
          .from(userTable)
          .where(eq(userTable.email, email)),
      "Failed to fetch user"
    );

    // Check if user exists
    if (existingUser.length === 0) {
      throwUnauthorized("Invalid email or password, please try again");
    }

    const user = existingUser[0];

    // Check if user is active
    if (user.status !== "active") {
      throwUnauthorized("The account is inactive, please contact support");
    }

    // Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (user.password !== password) {
      throwUnauthorized("Invalid email or password, please try again");
    }

    // Generate tokens
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    setAuthenticationCookies({
      res: ctx.res,
      accessToken,
      refreshToken,
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }),

  // Logout - Clear cookies
  logout: publicProcedure.mutation(async ({ ctx }) => {
    // Clear authentication cookies using the helper function
    clearAuthenticationCookies(ctx.res);

    return {
      success: true,
      message: "Logged out successfully",
    };
  }),
});
