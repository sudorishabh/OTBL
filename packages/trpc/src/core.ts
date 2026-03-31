/**
 * Core tRPC exports
 *
 * This file re-exports from middleware.ts for backwards compatibility.
 * All procedures and middleware are now defined in middleware.ts
 */
export {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  managerProcedure,
  operatorProcedure,
  createRoleProtectedProcedure,
  createMultiRoleProcedure,
  router,
  hasRole,
  hasAnyRole,
  USER_ROLES,
  type UserRole,
} from "./middleware";
