import { cache } from "react";
import { createDb } from "@xreviews/db";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export const getServerDb = cache(() => {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database-backed routes.");
  }

  return createDb(databaseUrl);
});

export function tryGetServerDb() {
  return isDatabaseConfigured() ? getServerDb() : null;
}
