import { z } from "zod";
import { MVP_CATEGORIES } from "@xreviews/shared/constants";

export const mvpCategorySchema = z.enum(MVP_CATEGORIES);

export const searchPlaceholderSchema = z.object({
  q: z.string().trim().min(1).max(80),
  category: mvpCategorySchema.optional()
});

export type SearchPlaceholderInput = z.infer<typeof searchPlaceholderSchema>;
