import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuthCoreTables, createDb } from "@xreviews/db";
import * as dbSchema from "@xreviews/db/schema";
import { sendMagicLinkEmail } from "@/server/email/resend";

const DEVELOPMENT_DATABASE_URL =
  "postgresql://xreviews:xreviews@127.0.0.1:5432/xreviews";
const DEVELOPMENT_AUTH_SECRET =
  "development-only-xreviews-better-auth-secret-000000";

const isProduction = process.env.NODE_ENV === "production";
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

function requireProductionEnv(name: string, value: string | undefined) {
  if (isProduction && !isProductionBuild && !value) {
    throw new Error(`${name} is required in production.`);
  }

  return value;
}

function getAuthBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

function getDatabaseUrl() {
  return (
    requireProductionEnv("DATABASE_URL", process.env.DATABASE_URL?.trim()) ||
    DEVELOPMENT_DATABASE_URL
  );
}

function getAuthSecret() {
  return (
    requireProductionEnv(
      "BETTER_AUTH_SECRET",
      process.env.BETTER_AUTH_SECRET?.trim()
    ) || DEVELOPMENT_AUTH_SECRET
  );
}

export function isAuthDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

const baseURL = getAuthBaseUrl();
const trustedOrigins = Array.from(
  new Set(
    [baseURL, process.env.NEXT_PUBLIC_APP_URL?.trim(), "http://localhost:3000"].filter(
      (origin): origin is string => Boolean(origin)
    )
  )
);

const db = createDb(getDatabaseUrl());
const adapterSchema = {
  ...dbSchema,
  ...betterAuthCoreTables,
  verification_tokens: dbSchema.verificationTokens
};

export const auth = betterAuth({
  appName: "Xreviews",
  baseURL,
  secret: getAuthSecret(),
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: adapterSchema
  }),
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: ["user", "business", "admin"],
        required: true,
        defaultValue: "user",
        input: false
      }
    }
  },
  account: {
    modelName: "accounts"
  },
  session: {
    modelName: "sessions"
  },
  verification: {
    modelName: "verification_tokens"
  },
  advanced: {
    ipAddress: {
      disableIpTracking: true
    },
    database: {
      generateId: false
    }
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      }
    }),
    nextCookies()
  ]
});

export type Auth = typeof auth;
