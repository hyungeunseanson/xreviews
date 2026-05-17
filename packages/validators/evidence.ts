import { z } from "zod";

export const EVIDENCE_TYPES = [
  "receipt",
  "invoice",
  "estimate",
  "contract",
  "photo",
  "video",
  "message",
  "other"
] as const;

export const ALLOWED_EVIDENCE_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
] as const;

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_EVIDENCE_FILES_PER_REVIEW = 10;

const fileNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .refine((value) => !/[\\/\0]/.test(value), {
    message: "File name cannot contain path separators."
  });

export const evidenceTypeSchema = z.enum(EVIDENCE_TYPES);
export const evidenceFileTypeSchema = z.enum(ALLOWED_EVIDENCE_FILE_TYPES);

export const evidenceMetadataInputSchema = z.object({
  fileName: fileNameSchema,
  fileType: evidenceFileTypeSchema,
  fileSizeBytes: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_EVIDENCE_FILE_SIZE_BYTES),
  evidenceType: evidenceTypeSchema
});

export const createEvidenceUploadIntentInputSchema = evidenceMetadataInputSchema;

export const evidenceIdsSchema = z
  .array(z.uuid())
  .max(MAX_EVIDENCE_FILES_PER_REVIEW)
  .transform((ids) => Array.from(new Set(ids)));

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];
export type AllowedEvidenceFileType = (typeof ALLOWED_EVIDENCE_FILE_TYPES)[number];
export type EvidenceMetadataInput = z.infer<typeof evidenceMetadataInputSchema>;
