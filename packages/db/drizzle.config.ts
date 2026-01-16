import { defineConfig } from "drizzle-kit";
// import appEnv from "./src/config/app-env";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../apps/server/.env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export default defineConfig({
  out: "./migrations",
  schema: "./src/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
