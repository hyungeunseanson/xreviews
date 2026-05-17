import { z } from "zod";
import { MVP_CATEGORIES } from "@xreviews/shared/constants";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(max).optional()
  );

const forbiddenPersonTargetTerms = [
  "person",
  "individual",
  "influencer",
  "doctor_person",
  "lawyer_person",
  "개인 리뷰",
  "인물 리뷰"
] as const;

export const mvpCategorySchema = z.enum(MVP_CATEGORIES);

export const subjectNameSchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(1, "Subject name is required.").max(120)
  )
  .refine(
    (value) =>
      !forbiddenPersonTargetTerms.some((term) =>
        value.toLowerCase().includes(term)
      ),
    "Person review targets are not allowed."
  );

export const createSubjectInputSchema = z.object({
  name: subjectNameSchema,
  category: mvpCategorySchema,
  description: optionalText(500),
  address: optionalText(240),
  city: optionalText(80),
  district: optionalText(80),
  phone: optionalText(40),
  website: z.preprocess(
    emptyToUndefined,
    z.string().trim().url().max(2048).optional()
  )
});

export const subjectSearchInputSchema = z.object({
  q: optionalText(80),
  category: mvpCategorySchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const searchPlaceholderSchema = z.object({
  q: z.string().trim().min(1).max(80),
  category: mvpCategorySchema.optional()
});

export type CreateSubjectInput = z.infer<typeof createSubjectInputSchema>;
export type SubjectSearchInput = z.infer<typeof subjectSearchInputSchema>;
export type SearchPlaceholderInput = z.infer<typeof searchPlaceholderSchema>;
