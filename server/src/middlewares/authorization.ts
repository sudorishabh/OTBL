import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

// Role hierarchy for permission checking
const roleHierarchy = {
  admin: 5,
  manager: 4,
  staff: 3,
  operator: 2,
  viewer: 1,
};

type UserRole = keyof typeof roleHierarchy;

/**
 * Middleware to check if user has required role
 * @param minRole - Minimum role required to access the procedure
 */
export const hasRole = (minRole: UserRole) => {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    const userRole = ctx.user.role as UserRole;
    const userRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You need ${minRole} role or higher to access this resource`,
      });
    }

    return next({ ctx: { user: ctx.user } });
  });
};

/**
 * Middleware to check if user has one of the specified roles
 * @param allowedRoles - Array of roles that can access the procedure
 */
export const hasAnyRole = (allowedRoles: UserRole[]) => {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    const userRole = ctx.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    return next({ ctx: { user: ctx.user } });
  });
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = hasRole("admin");

/**
 * Middleware to check if user is manager or higher
 */
export const isManager = hasRole("manager");

/**
 * Middleware to check if user is staff or higher
 */
export const isStaff = hasRole("staff");
