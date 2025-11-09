// src/routers/_app.ts
import { router } from ".";
import { officeMutationRouter } from "@/modules/office/office.mutation.routes";
import { officeQueryRouter } from "@/modules/office/office.query.routes";
import { siteMutationRouter } from "@/modules/site/site.mutation.routes";
import { siteQueryRouter } from "@/modules/site/site.query.routes";
import { userMutationRouter } from "@/modules/user/user.mutation.route";
import { userQueryRouter } from "@/modules/user/user.query.route";
import { authMutationRouter } from "@/modules/auth/auth.mutation.route";
import { authQueryRouter } from "@/modules/auth/auth.query.route";
import { clientMutationRouter } from "@/modules/client/client.muatation.route";
import { clientQueryRouter } from "@/modules/client/client.query.route";
import { workOrderMutationRouter } from "@/modules/work-order/work-mutation.mutation.route";
import { workOrderQueryRouter } from "@/modules/work-order/work-order.query.route";
import { siteActivityMutationRouter } from "@/modules/site-activity/site-activity.mutation.router";
import { siteActivityQueryRouter } from "@/modules/site-activity/site-activity.query.router";

export const appRouter = router({
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

  // Site Activity management
  siteActivityMutation: siteActivityMutationRouter,
  siteActivityQuery: siteActivityQueryRouter,
});

export type AppRouter = typeof appRouter;
