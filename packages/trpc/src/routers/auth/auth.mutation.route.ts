import { eq } from "drizzle-orm";
import {
  signToken,
  signRefreshToken,
  setAuthenticationCookies,
  clearAuthenticationCookies,
  verifyPassword,
  type UserRole,
} from "@pkg/auth";
import { schema } from "@pkg/db";
import { constants } from "@pkg/utils";
import { publicProcedure } from "../../middleware";
import { router } from "../../trpc";
import { loginSchema } from "./auth.schema";
import {
  throwUnauthorizedError,
  throwInternalError,
  handleDatabaseOperation,
} from "../../errors";
import { handleMutation } from "../../helper/typed-handler";

const { STATUS } = constants;
const { userTable } = schema;

export const authMutationRouter = router({
  login: publicProcedure.input(loginSchema).mutation(
    handleMutation(async ({ input, ctx }) => {
      const { email, password } = input;

      try {
        const users = await handleDatabaseOperation(async () => {
          return ctx.db
            .select({
              id: userTable.id,
              name: userTable.name,
              email: userTable.email,
              role: userTable.role,
              status: userTable.status,
              password: userTable.password,
            })
            .from(userTable)
            .where(eq(userTable.email, email));
        }, "Failed to fetch user by email");

        const user = users?.[0];

        if (!user) {
          throwUnauthorizedError("Invalid email or password, please try again");
        }

        if (user.status !== STATUS.ACTIVE) {
          throwUnauthorizedError(
            "The account is inactive, please contact support"
          );
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
          throwUnauthorizedError("Invalid email or password, please try again");
        }
        const payload = {
          sub: user.id.toString(),
          email: user.email,
          role: user.role as UserRole,
        };

        const accessToken = signToken(
          payload,
          ctx.appEnv.JWT.SECRET,
          ctx.appEnv.JWT.EXPIRES_IN
        );

        const refreshToken = signRefreshToken(
          payload,
          ctx.appEnv.JWT.REFRESH_SECRET,
          ctx.appEnv.JWT.REFRESH_EXPIRES_IN
        );

        setAuthenticationCookies({
          res: ctx.res,
          accessToken,
          refreshToken,
          accessExpiresIn: ctx.appEnv.JWT.EXPIRES_IN,
          refreshExpiresIn: ctx.appEnv.JWT.REFRESH_EXPIRES_IN,
          node_env: ctx.appEnv.NODE_ENV,
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
      } catch (error) {
        if (error instanceof Error && error.name === "TRPCError") {
          throw error;
        }
        console.error("[Auth] Login error:", error);
        throwInternalError("An unexpected error occurred during login");
      }
    })
  ),

  logout: publicProcedure.mutation(
    handleMutation(async ({ ctx }) => {
      try {
        clearAuthenticationCookies(ctx.res);

        return {
          success: true,
          message: "Logged out successfully",
        };
      } catch (error) {
        console.error("[Auth] Logout error:", error);
        throwInternalError("An unexpected error occurred during logout");
      }
    })
  ),
});
