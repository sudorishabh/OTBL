import { defineConfig } from "drizzle-kit";
import appEnv from "./src/config/app-env";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: appEnv.DATABASE_URL,
  },
});
