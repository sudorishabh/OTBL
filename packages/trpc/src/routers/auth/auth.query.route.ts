import { eq } from "drizzle-orm";
import {
  signToken,
  signRefreshToken,
  setAuthenticationCookies,
  verifyRefreshTokenSafe,
  type UserRole,
} from "@pkg/auth";
import { schema } from "@pkg/db";
import { constants } from "@pkg/utils";
import { router } from "../../trpc";
import { protectedProcedure, publicProcedure } from "../../middleware";
import { handleDatabaseOperation } from "../../errors";
import { handleQuery } from "../../helper/typed-handler";
const { STATUS } = constants;
const { userTable } = schema;

export const authQueryRouter = router({
  me: publicProcedure.query(
    handleQuery(async ({ ctx }) => {
      try {
        if (ctx.user) {
          const existingUser = await handleDatabaseOperation(
            async () => {
              return ctx.db
                .select({
                  id: userTable.id,
                  name: userTable.name,
                  email: userTable.email,
                  role: userTable.role,
                  status: userTable.status,
                })
                .from(userTable)
                .where(eq(userTable.id, parseInt(ctx.user!.sub)));
            },
            "Failed to fetch user by ID"
          );

          const user = existingUser[0];

          if (user && user.status === STATUS.ACTIVE) {
            return {
              success: true,
              user,
            };
          }
        }

        // No valid access token, try refresh token
        const refreshToken = ctx.req?.cookies?.refreshToken;

        if (!refreshToken) {
          return {
            success: false,
            user: null,
          };
        }

        // Verify refresh token using the REFRESH secret
        const verificationResult = verifyRefreshTokenSafe(
          refreshToken,
          ctx.appEnv.JWT.REFRESH_SECRET
        );

        if (!verificationResult.success) {
          return {
            success: false,
            user: null,
          };
        }

        const payload = verificationResult.payload;

        // Fetch user from database to ensure they still exist and are active
        const existingUser = await handleDatabaseOperation(async () => {
          return ctx.db
            .select({
              id: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: userTable.role,
              status: userTable.status,
            })
            .from(userTable)
            .where(eq(userTable.id, parseInt(payload.sub)));
        }, "Failed to fetch user by ID");

        const user = existingUser[0];

        if (!user || user.status !== STATUS.ACTIVE) {
          return {
            success: false,
            user: null,
          };
        }

        // Generate new tokens (token rotation for security)
        const tokenPayload = {
          sub: user.id.toString(),
          email: user.email,
          role: user.role as UserRole,
        };

        const newAccessToken = signToken(
          tokenPayload,
          ctx.appEnv.JWT.SECRET,
          ctx.appEnv.JWT.EXPIRES_IN
        );

        const newRefreshToken = signRefreshToken(
          tokenPayload,
          ctx.appEnv.JWT.REFRESH_SECRET,
          ctx.appEnv.JWT.REFRESH_EXPIRES_IN
        );

        // Set new cookies with rotated tokens
        setAuthenticationCookies({
          res: ctx.res,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          accessExpiresIn: ctx.appEnv.JWT.EXPIRES_IN,
          refreshExpiresIn: ctx.appEnv.JWT.REFRESH_EXPIRES_IN,
          node_env: ctx.appEnv.NODE_ENV,
        });

        return {
          success: true,
          user,
        };
      } catch (error) {
        console.error("[Auth] Get current user error:", error);
        return {
          success: false,
          user: null,
        };
      }
    })
  ),

  hasRole: protectedProcedure.query(({ ctx }) => {
    return {
      success: true,
      role: ctx.user.role,
    };
  }),
});
