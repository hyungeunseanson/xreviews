import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl.default("http://localhost:3000"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalString,
  NEXT_PUBLIC_CLARITY_PROJECT_ID: optionalString,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString
});

const productionEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("Xreviews"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required in production."),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters."),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL."),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required in production."),
  RESEND_FROM_EMAIL: z
    .string()
    .min(1, "RESEND_FROM_EMAIL is required in production."),
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required in production."),
  R2_ACCESS_KEY_ID: z
    .string()
    .min(1, "R2_ACCESS_KEY_ID is required in production."),
  R2_SECRET_ACCESS_KEY: z
    .string()
    .min(1, "R2_SECRET_ACCESS_KEY is required in production."),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required in production."),
  TURNSTILE_SECRET_KEY: z
    .string()
    .min(1, "TURNSTILE_SECRET_KEY is required in production."),
  SENTRY_DSN: optionalUrl,
  IP_HASH_SALT: z.string().min(16, "IP_HASH_SALT is required in production."),
  ADMIN_EMAIL: optionalString
});

const developmentEnvSchema = productionEnvSchema.partial({
  DATABASE_URL: true,
  BETTER_AUTH_SECRET: true,
  BETTER_AUTH_URL: true,
  RESEND_API_KEY: true,
  RESEND_FROM_EMAIL: true,
  R2_ACCOUNT_ID: true,
  R2_ACCESS_KEY_ID: true,
  R2_SECRET_ACCESS_KEY: true,
  R2_BUCKET_NAME: true,
  TURNSTILE_SECRET_KEY: true,
  IP_HASH_SALT: true
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type XreviewsEnv = z.infer<typeof productionEnvSchema>;

export function getPublicEnv(
  raw: Record<string, string | undefined> = process.env
): PublicEnv {
  return publicEnvSchema.parse(raw);
}

export function getOptionalEnv(
  raw: Record<string, string | undefined> = process.env
) {
  return developmentEnvSchema.parse(raw);
}

export function validateProductionEnv(
  raw: Record<string, string | undefined> = process.env
): XreviewsEnv {
  return productionEnvSchema.parse({
    ...raw,
    NODE_ENV: raw.NODE_ENV ?? "production"
  });
}
