import { z } from "zod";
import { evidenceIdsSchema } from "./evidence";

export const FORBIDDEN_REVIEW_FIELD_NAMES = [
  "rating",
  "starRating",
  "star_rating",
  "averageRating",
  "average_rating",
  "stars"
] as const;

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const requiredText = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(min).max(max)
  );

const requiredTrue = z.preprocess(
  (value) => (value === "on" || value === "true" ? true : value),
  z.literal(true)
);

export const createReviewInputSchema = z
  .object({
    subjectId: z.uuid(),
    title: requiredText(4, 140),
    issueSummary: requiredText(6, 220),
    body: requiredText(30, 5000),
    riskTagIds: z
      .array(z.uuid())
      .min(1)
      .transform((ids) => Array.from(new Set(ids))),
    evidenceIds: evidenceIdsSchema.default([]),
    severityScore: z.coerce.number().int().min(1).max(5),
    authorLiabilityConfirmed: requiredTrue
  })
  .strict();

export function containsForbiddenReviewField(fields: Iterable<string>) {
  const forbiddenFields = new Set<string>(FORBIDDEN_REVIEW_FIELD_NAMES);

  for (const field of fields) {
    if (forbiddenFields.has(field)) {
      return true;
    }
  }

  return false;
}

export const reviewActionSearchParamsSchema = z.object({
  error: z
    .enum([
      "invalid",
      "tags",
      "liability",
      "positive",
      "medical",
      "evidence",
      "subject",
      "database",
      "create"
    ])
    .optional()
});

export const optionalReviewBodySchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional()
);

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
export type ReviewActionError = NonNullable<
  z.infer<typeof reviewActionSearchParamsSchema>["error"]
>;
