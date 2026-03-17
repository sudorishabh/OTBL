import { t } from "./trpc";
import type { TrpcUser, TrpcAuthenticatedContext } from "./context";
import { USER_ROLES, ROLE_HIERARCHY, type UserRole } from "@pkg/utils/auth";
import {
  createUnauthorizedError,
  createInsufficientPermissionsError,
  appErrorToTRPCError,
} from "./errors";

// Re-export role constants for use in routers
export { USER_ROLES, ROLE_HIERARCHY };
export type { UserRole };

/**
 * Authentication middleware - ensures user is logged in
 * Throws UNAUTHORIZED if no user is present in context
 */
export const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw appErrorToTRPCError(
      createUnauthorizedError("You must be logged in to access this resource", {
        devMessage: "No user in context",
      }),
    );
  }

  if (!ctx.user.sub) {
    throw appErrorToTRPCError(
      createUnauthorizedError(
        "Invalid authentication token. Please log in again.",
        { devMessage: "User context missing sub claim" },
      ),
    );
  }

  // Pass the user with guaranteed type to next middleware/procedure
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    } as TrpcAuthenticatedContext,
  });
});

/**
 * Role-based authorization middleware factory
 * @param minRole - Minimum role level required to access the procedure
 * @returns Middleware that checks if user has at least the minimum role
 */
export const hasRole = (minRole: UserRole) => {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw appErrorToTRPCError(
        createUnauthorizedError(
          "You must be logged in to access this resource",
          { devMessage: "No user in context for role check" },
        ),
      );
    }

    const userRole = ctx.user.role as UserRole;
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      throw appErrorToTRPCError(
        createInsufficientPermissionsError(minRole, {
          devMessage: `User role "${userRole}" (level ${userRoleLevel}) is below required role "${minRole}" (level ${requiredRoleLevel})`,
        }),
      );
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      } as TrpcAuthenticatedContext,
    });
  });
};

/**
 * Multi-role authorization middleware factory
 * @param allowedRoles - Array of roles that can access the procedure
 * @returns Middleware that checks if user has one of the allowed roles
 */
export const hasAnyRole = (allowedRoles: UserRole[]) => {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw appErrorToTRPCError(
        createUnauthorizedError(
          "You must be logged in to access this resource",
          {
            devMessage: "No user in context for role check",
          },
        ),
      );
    }

    const userRole = ctx.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw appErrorToTRPCError(
        createInsufficientPermissionsError(allowedRoles.join(", "), {
          userMessage: "You don't have permission to access this resource.",
          devMessage: `User role "${userRole}" not in allowed roles: [${allowedRoles.join(", ")}]`,
        }),
      );
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      } as TrpcAuthenticatedContext,
    });
  });
};

/**
 * Preset role middlewares for common use cases
 */
export const isAdmin = hasRole(USER_ROLES.ADMIN);
export const isManager = hasRole(USER_ROLES.MANAGER);
export const isStaff = hasRole(USER_ROLES.STAFF);
export const isOperator = hasRole(USER_ROLES.OPERATOR);

/**
 * Admin or Manager middleware
 */
export const isAdminOrManager = hasAnyRole([
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
]);

/**
 * Staff and above middleware (admin, manager, staff)
 */
export const isStaffOrAbove = hasAnyRole([
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
]);
