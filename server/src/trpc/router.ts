// src/routers/_app.ts
import { router } from ".";
import { officeMutationRouter } from "../modules/office/office.mutation.routes";
import { officeQueryRouter } from "../modules/office/office.query.routes";
import { activityMutationRouter } from "../modules/activity/activity.mutation.routes";
import { activityQueryRoutes } from "../modules/activity/activity.query.routes";
import { budgetCategoryMutationRouter } from "../modules/budget-category/budget-category.mutation.routes";
import { budgetCategoryQueryRoutes } from "../modules/budget-category/budget-category.query.routes";
import { siteMutationRouter } from "../modules/site/site.mutation.routes";
import { siteQueryRouter } from "../modules/site/site.query.routes";

export const appRouter = router({
  officeMutation: officeMutationRouter,
  officeQuery: officeQueryRouter,

  activityMutation: activityMutationRouter,
  activityQuery: activityQueryRoutes,

  budgetCategoryMutation: budgetCategoryMutationRouter,
  budgetCategoryQuery: budgetCategoryQueryRoutes,

  siteMutation: siteMutationRouter,
  siteQuery: siteQueryRouter,
});

export type AppRouter = typeof appRouter;
