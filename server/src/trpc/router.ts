// src/routers/_app.ts
import { router } from ".";
import { officeRouter } from "../modules/office/office.routes";

export const appRouter = router({
  //   auth: authRouter,
  office: officeRouter,
});

export type AppRouter = typeof appRouter;
