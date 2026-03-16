import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";

function createDb(DATABASE_URL: string) {
  const poolConnection = mysql.createPool({
    uri: DATABASE_URL,
    connectionLimit: 10,
  });

  return drizzle(poolConnection, { schema, mode: "default" });
}

export type Database = ReturnType<typeof createDb>;

export default createDb;
