import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import cors from "./config/cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/context";
import { errorHandler } from "./middlewares/error-handler";
import bcrypt from "bcrypt";

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);

// const hashSaltRounds = 12;
// const hashedPassword = bcrypt.hashSync("Rishabh@11", hashSaltRounds);
// console.log("Hashed Password:", hashedPassword);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createContext,
  })
);

app.use(errorHandler);

export default app;
