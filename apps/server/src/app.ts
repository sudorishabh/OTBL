import cookieParser from "cookie-parser";
import express, { json, response, urlencoded } from "express";
import cors from "./config/cors";
import * as trpcExpress from "@trpc/server/adapters/express";
// import { appRouter } from "./trpc/router";
import { appRouter } from "@pkg/trpc";
import { createContext } from "./context";
import { errorHandler } from "./middlewares/error-handler";

const app = express();

app.use(cors);
app.use(json({ limit: "100mb" }));
app.use(urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createContext,
  })
);

app.use(errorHandler);

export default app;
