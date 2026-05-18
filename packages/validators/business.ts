import { z } from "zod";

export const BUSINESS_CLAIM_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "revoked"
] as const;

export const BUSINESS_RESPONSE_TYPES = [
  "explanation",
  "apology",
  "correction",
  "dispute",
  "resolved"
] as const;

export const BUSINESS_IMPROVEMENT_CATEGORIES = [
  "hygiene",
  "price_policy",
  "refund_policy",
  "staff_training",
  "facility",
  "other"
] as const;

export const BUSINESS_SUBSCRIPTION_PLANS = [
  "free_claim",
  "official_basic",
  "official_pro",
  "multi_location",
  "data_api"
] as const;

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const trimmedText = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(min).max(max)
  );

const optionalTrimmedText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

export const createBusinessClaimInputSchema = z
  .object({
    subjectId: z.uuid(),
    businessName: trimmedText(2, 140),
    applicantName: trimmedText(2, 100),
    contactEmail: z.email().max(254),
    contactPhone: optionalTrimmedText(40),
    registrationNumber: optionalTrimmedText(80),
    verificationNote: trimmedText(10, 1000)
  })
  .strict();

export const adminBusinessClaimActionInputSchema = z
  .object({
    claimId: z.uuid(),
    adminNote: optionalTrimmedText(1000)
  })
  .strict();

export const upsertBusinessResponseInputSchema = z
  .object({
    reviewId: z.uuid(),
    responseType: z.enum(BUSINESS_RESPONSE_TYPES).default("explanation"),
    body: trimmedText(10, 2000)
  })
  .strict();

export const createBusinessImprovementPostInputSchema = z
  .object({
    subjectId: z.uuid(),
    title: trimmedText(4, 140),
    body: trimmedText(20, 3000),
    category: z.enum(BUSINESS_IMPROVEMENT_CATEGORIES).default("other")
  })
  .strict();

export const updateBusinessImprovementPostInputSchema = z
  .object({
    postId: z.uuid(),
    title: trimmedText(4, 140),
    body: trimmedText(20, 3000),
    category: z.enum(BUSINESS_IMPROVEMENT_CATEGORIES).default("other")
  })
  .strict();

export type CreateBusinessClaimInput = z.infer<
  typeof createBusinessClaimInputSchema
>;
export type AdminBusinessClaimActionInput = z.infer<
  typeof adminBusinessClaimActionInputSchema
>;
export type UpsertBusinessResponseInput = z.infer<
  typeof upsertBusinessResponseInputSchema
>;
export type CreateBusinessImprovementPostInput = z.infer<
  typeof createBusinessImprovementPostInputSchema
>;
export type UpdateBusinessImprovementPostInput = z.infer<
  typeof updateBusinessImprovementPostInputSchema
>;
export type BusinessClaimStatus = (typeof BUSINESS_CLAIM_STATUSES)[number];
export type BusinessResponseType = (typeof BUSINESS_RESPONSE_TYPES)[number];
export type BusinessImprovementCategory =
  (typeof BUSINESS_IMPROVEMENT_CATEGORIES)[number];
export type BusinessSubscriptionPlan =
  (typeof BUSINESS_SUBSCRIPTION_PLANS)[number];
