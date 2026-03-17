import cookieParser from "cookie-parser";
import express, { json, response, urlencoded, Request, Response } from "express";
import cors from "./config/cors";
import * as trpcExpress from "@trpc/server/adapters/express";
// import { appRouter } from "./trpc/router";
import { appRouter } from "@pkg/trpc";
import { createContext } from "./context";
import { errorHandler } from "./middlewares/error-handler";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"), 
});

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

app.listen(7200, () => {
  console.log(`Server is running on port 7200 in ${process.env.NODE_ENV} mode`);
});


export default app;
