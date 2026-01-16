import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import envServer from "../config/app-env";

const poolConnection = mysql.createPool({
  uri: envServer.DATABASE_URL,
  connectionLimit: 10,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
