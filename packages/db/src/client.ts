import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDb(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create the Xreviews database client.");
  }

  const sql = neon(databaseUrl);

  return drizzle(sql, { schema });
}

export type XreviewsDb = ReturnType<typeof createDb>;
