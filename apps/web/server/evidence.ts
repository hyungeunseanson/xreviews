import { and, eq, inArray, isNull } from "drizzle-orm";
import { auditLogs, reviewEvidence, reviews } from "@xreviews/db/schema";
import {
  createEvidenceUploadIntentInputSchema,
  type EvidenceMetadataInput
} from "@xreviews/validators";
import { getServerDb, tryGetServerDb } from "@/server/db";
import {
  createEvidenceObjectKey,
  createEvidenceUploadUrl,
  R2ConfigurationError
} from "@/server/r2";
import type { UserRole } from "@/server/session";

type EvidenceErrorCode =
  | "invalid"
  | "database"
  | "storage"
  | "forbidden"
  | "metadata"
  | "attach";

type EvidenceActor = {
  userId: string;
  role: UserRole;
};

export class EvidenceWriteError extends Error {
  code: EvidenceErrorCode;

  constructor(code: EvidenceErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export type EvidenceUploadIntent = {
  evidenceId: string;
  uploadUrl: string;
  expiresInSeconds: number;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  evidenceType: EvidenceMetadataInput["evidenceType"];
};

function getEvidenceDb() {
  const db = tryGetServerDb();

  if (!db) {
    throw new EvidenceWriteError("database", "DATABASE_URL is required.");
  }

  return db;
}

function toClientEvidence(row: typeof reviewEvidence.$inferSelect) {
  return {
    id: row.id,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSizeBytes: row.fileSizeBytes,
    evidenceType: row.evidenceType,
    createdAt: row.createdAt
  };
}

export async function createEvidenceUploadIntent(
  rawInput: unknown,
  actor: EvidenceActor
) {
  const input = createEvidenceUploadIntentInputSchema.parse(rawInput);
  const evidenceId = crypto.randomUUID();
  const objectKey = createEvidenceObjectKey({
    userId: actor.userId,
    fileName: input.fileName
  });

  try {
    const { uploadUrl, expiresInSeconds } = await createEvidenceUploadUrl({
      objectKey,
      fileType: input.fileType
    });

    return {
      evidenceId,
      objectKey,
      uploadUrl,
      expiresInSeconds,
      metadata: input
    };
  } catch (error) {
    if (error instanceof R2ConfigurationError) {
      throw new EvidenceWriteError(
        "storage",
        "Cloudflare R2 settings are required for evidence upload."
      );
    }

    throw error;
  }
}

export async function createReviewEvidenceMetadata(
  input: {
    evidenceId: string;
    objectKey: string;
    metadata: EvidenceMetadataInput;
  },
  actor: EvidenceActor
) {
  if (!input.objectKey.startsWith(`evidence/${actor.userId}/`)) {
    throw new EvidenceWriteError("forbidden", "Evidence object key is not owned by user.");
  }

  const db = getEvidenceDb();

  const [createdRows] = await db.batch([
    db
      .insert(reviewEvidence)
      .values({
        id: input.evidenceId,
        reviewId: null,
        uploadedByUserId: actor.userId,
        evidenceType: input.metadata.evidenceType,
        r2ObjectKey: input.objectKey,
        fileName: input.metadata.fileName,
        fileType: input.metadata.fileType,
        fileSizeBytes: input.metadata.fileSizeBytes,
        isPrivate: true
      })
      .returning(),
    db.insert(auditLogs).values({
      actorUserId: actor.userId,
      actorRole: actor.role,
      action: "evidence_upload_intent_created",
      targetType: "evidence",
      targetId: input.evidenceId,
      metadata: {
        evidenceType: input.metadata.evidenceType,
        fileType: input.metadata.fileType,
        fileSizeBytes: input.metadata.fileSizeBytes,
        phase: "phase_5_evidence_upload"
      }
    }),
    db.insert(auditLogs).values({
      actorUserId: actor.userId,
      actorRole: actor.role,
      action: "evidence_metadata_created",
      targetType: "evidence",
      targetId: input.evidenceId,
      metadata: {
        evidenceType: input.metadata.evidenceType,
        fileType: input.metadata.fileType,
        fileSizeBytes: input.metadata.fileSizeBytes,
        reviewId: null,
        phase: "phase_5_evidence_upload"
      }
    })
  ]);

  const createdEvidence = createdRows[0];

  if (!createdEvidence) {
    throw new EvidenceWriteError("metadata", "Evidence metadata was not saved.");
  }

  return toClientEvidence(createdEvidence);
}

export async function createEvidenceUploadSession(
  rawInput: unknown,
  actor: EvidenceActor
): Promise<EvidenceUploadIntent> {
  const intent = await createEvidenceUploadIntent(rawInput, actor);
  const evidence = await createReviewEvidenceMetadata(
    {
      evidenceId: intent.evidenceId,
      objectKey: intent.objectKey,
      metadata: intent.metadata
    },
    actor
  );

  return {
    evidenceId: evidence.id,
    uploadUrl: intent.uploadUrl,
    expiresInSeconds: intent.expiresInSeconds,
    fileName: evidence.fileName,
    fileType: evidence.fileType,
    fileSizeBytes: evidence.fileSizeBytes,
    evidenceType: evidence.evidenceType
  };
}

export async function ensureEvidenceAttachableToReview(
  evidenceIds: string[],
  actor: EvidenceActor
) {
  if (evidenceIds.length === 0) {
    return [];
  }

  const db = getEvidenceDb();
  const rows = await db
    .select({
      id: reviewEvidence.id,
      reviewId: reviewEvidence.reviewId,
      uploadedByUserId: reviewEvidence.uploadedByUserId
    })
    .from(reviewEvidence)
    .where(inArray(reviewEvidence.id, evidenceIds));

  const ownedAttachableIds = new Set(
    rows
      .filter(
        (row) => row.uploadedByUserId === actor.userId && row.reviewId === null
      )
      .map((row) => row.id)
  );

  if (ownedAttachableIds.size !== evidenceIds.length) {
    throw new EvidenceWriteError(
      "forbidden",
      "Evidence must belong to the current user and be unattached."
    );
  }

  return rows;
}

export async function attachEvidenceToReview(
  input: {
    evidenceIds: string[];
    reviewId: string;
    subjectId: string;
  },
  actor: EvidenceActor
) {
  if (input.evidenceIds.length === 0) {
    return 0;
  }

  const db = getEvidenceDb();
  const updatedRows = await db
    .update(reviewEvidence)
    .set({ reviewId: input.reviewId })
    .where(
      and(
        inArray(reviewEvidence.id, input.evidenceIds),
        eq(reviewEvidence.uploadedByUserId, actor.userId),
        isNull(reviewEvidence.reviewId)
      )
    )
    .returning({ id: reviewEvidence.id });

  if (updatedRows.length !== input.evidenceIds.length) {
    throw new EvidenceWriteError("attach", "Evidence could not be attached.");
  }

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "evidence_attached_to_review",
    targetType: "review",
    targetId: input.reviewId,
    metadata: {
      reviewId: input.reviewId,
      subjectId: input.subjectId,
      evidenceIds: input.evidenceIds,
      evidenceCount: input.evidenceIds.length,
      phase: "phase_5_evidence_upload"
    }
  });

  return updatedRows.length;
}

export async function getEvidenceForReviewForOwner(
  reviewId: string,
  actor: EvidenceActor
) {
  const db = getServerDb();

  const rows = await db
    .select({
      evidence: reviewEvidence,
      reviewUserId: reviews.userId
    })
    .from(reviewEvidence)
    .innerJoin(reviews, eq(reviews.id, reviewEvidence.reviewId))
    .where(eq(reviewEvidence.reviewId, reviewId));

  if (rows.length === 0) {
    return [];
  }

  const ownsReview = rows.some((row) => row.reviewUserId === actor.userId);
  const canRead = ownsReview || actor.role === "admin";

  if (!canRead) {
    // TODO: allow verified related business accounts after claim ownership exists.
    throw new EvidenceWriteError("forbidden", "Evidence is private.");
  }

  return rows.map((row) => toClientEvidence(row.evidence));
}
