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
import { signToken, signRefreshToken, verifyRefreshToken } from "@/utils/jwt";
import { setAuthenticationCookies } from "@/utils/cookie";

export const authQueryRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    if (ctx.user) {
      const existingUser = await handleDatabaseOperation(
        () =>
          db
            .select({
              id: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: userTable.role,
              status: userTable.status,
            })
            .from(userTable)
            .where(eq(userTable.id, parseInt(ctx.user!.sub))),
        "Failed to fetch user"
      );

      if (existingUser.length > 0 && existingUser[0].status === "active") {
        return {
          success: true,
          user: existingUser[0],
        };
      }
    }

    // If no valid access token, try refresh token
    const refreshToken = ctx.req.cookies.refreshToken;

    if (!refreshToken) {
      return {
        success: false,
        user: null,
      };
    }

    try {
      const payload = verifyRefreshToken(refreshToken);

      // Fetch user from database
      const existingUser = await handleDatabaseOperation(
        () =>
          db
            .select({
              id: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: userTable.role,
              status: userTable.status,
            })
            .from(userTable)
            .where(eq(userTable.id, parseInt(payload.sub))),
        "Failed to fetch user"
      );

      if (existingUser.length === 0 || existingUser[0].status !== "active") {
        return {
          success: false,
          user: null,
        };
      }

      const user = existingUser[0];

      // Generate new tokens
      const newPayload = {
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = signToken(newPayload);
      const newRefreshToken = signRefreshToken(newPayload);

      setAuthenticationCookies({
        res: ctx.res,
        accessToken,
        refreshToken: newRefreshToken,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      // Invalid or expired refresh token
      return {
        success: false,
        user: null,
      };
    }
  }),
});
