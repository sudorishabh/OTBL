// src/routers/_app.ts
import { router } from "./trpc";
import { officeMutationRouter } from "./routers/office/office.mutation.route";
import { officeQueryRouter } from "./routers/office/office.query.route";
import { siteMutationRouter } from "./routers/site/site.mutation.route";
import { siteQueryRouter } from "./routers/site/site.query.route";
import { userMutationRouter } from "./routers/user/user.mutation.route";
import { userQueryRouter } from "./routers/user/user.query.route";
import { authMutationRouter } from "./routers/auth/auth.mutation.route";
import { authQueryRouter } from "./routers/auth/auth.query.route";
import { clientMutationRouter } from "./routers/client/client.muatation.route";
import { clientQueryRouter } from "./routers/client/client.query.route";
import { workOrderMutationRouter } from "./routers/work-order/work-mutation.mutation.route";
import { workOrderQueryRouter } from "./routers/work-order/work-order.query.route";
import { workOrderSiteQueryRouter } from "./routers/work-order-site/work-order-site.query.route";
import { workOrderSiteMutationRouter } from "./routers/work-order-site/work-order-site.mutation.route";
// import { siteActivityMutationRouter } from "./routers/site-activity/site-activity.mutation.route";
// import { siteActivityQueryRouter } from "./routers/site-activity/site-activity.query.route";
import { proposalMutationRouter } from "./routers/proposal/proposal.mutation.route";
import { proposalQueryRouter } from "./routers/proposal/proposal.query.route";
// import { technologyQueryRouter } from "./routers/technology/technology.query.route";
import { sharePointQueryRouter } from "./routers/sharepoint/sharepoint.query.route";
import { sharePointMutationRouter } from "./routers/sharepoint/sharepoint.mutation.route";
import { publicProcedure } from "./middleware";

export const appRouter = router({

  // Default route
  default: publicProcedure.query(() => {
    return { message: "Working" };
  }),

  // Auth
  authQuery: authQueryRouter,
  authMutation: authMutationRouter,

  // User authentication & management
  userMutation: userMutationRouter,
  userQuery: userQueryRouter,

  // Office management
  officeMutation: officeMutationRouter,
  officeQuery: officeQueryRouter,

  // Site management
  siteMutation: siteMutationRouter,
  siteQuery: siteQueryRouter,

  // Client management
  clientMutation: clientMutationRouter,
  clientQuery: clientQueryRouter,

  // Work Order management
  workOrderMutation: workOrderMutationRouter,
  workOrderQuery: workOrderQueryRouter,

  // Work Order Site management
  workOrderSiteQuery: workOrderSiteQueryRouter,
  workOrderSiteMutation: workOrderSiteMutationRouter,

  // Site Activity management
  // siteActivityMutation: siteActivityMutationRouter,
  // siteActivityQuery: siteActivityQueryRouter,

  proposalMutation: proposalMutationRouter,
  proposalQuery: proposalQueryRouter,

  // Technology management
  // technologyQuery: technologyQueryRouter,

  // SharePoint integration
  sharePointQuery: sharePointQueryRouter,
  sharePointMutation: sharePointMutationRouter,
});

export type AppRouter = typeof appRouter;

// Export context types for use in server context creation
export type {
  TrpcContext,
  TrpcUser,
  TrpcAuthenticatedContext,
  TrpcAppEnv,
} from "./context";

// Re-export Database type from @pkg/db for convenience
export type { Database } from "@pkg/db";

// Export procedures for creating custom routes
export {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  managerProcedure,
  staffProcedure,
  operatorProcedure,
  createRoleProtectedProcedure,
  createMultiRoleProcedure,
  hasRole,
  hasAnyRole,
  USER_ROLES,
} from "./middleware";

export type { UserRole } from "./middleware";

// Export validation schemas and validators for frontend reuse
export * from "./validation";

// Export route schemas for frontend form validation
export * from "./schemas";

// Export centralized error handling system
export * from "./errors";

// Re-export all types and schemas from @pkg/schema
// This is necessary to make the inferred type of appRouter portable
// Without this, TypeScript would reference '../node_modules/@pkg/schema/dist/...'
// which is not a portable path across different package managers and setups
export * from "@pkg/schema";
