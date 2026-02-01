import { createDB } from "@pkg/db";
import "dotenv/config";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const db = createDB(process.env.DATABASE_URL!);
