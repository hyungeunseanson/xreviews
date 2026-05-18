import {
  and,
  asc,
  desc,
  eq,
  inArray,
  ne
} from "drizzle-orm";
import {
  auditLogs,
  reviews,
  reviewTagLinks,
  riskTags,
  subjectCategoryRiskTags,
  subjects
} from "@xreviews/db/schema";
import {
  checkComplaintOnly,
  checkMedicalGuardrail,
  createReviewInputSchema,
  MEDICAL_GUARDRAIL_MESSAGE,
  POSITIVE_REVIEW_BLOCK_MESSAGE,
  type CreateReviewInput
} from "@xreviews/validators";
import { recordAnalyticsEvent } from "@/server/analytics";
import { getServerDb, tryGetServerDb } from "@/server/db";
import {
  attachEvidenceToReview,
  ensureEvidenceAttachableToReview,
  EvidenceWriteError
} from "@/server/evidence";
import type { UserRole } from "@/server/session";

type ReviewErrorCode =
  | "invalid"
  | "tags"
  | "liability"
  | "positive"
  | "medical"
  | "evidence"
  | "subject"
  | "database"
  | "create";

export class ReviewWriteError extends Error {
  code: ReviewErrorCode;

  constructor(code: ReviewErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export type PublicReview = {
  id: string;
  title: string;
  issueSummary: string | null;
  body: string;
  severityScore: number;
  evidenceLevel: number;
  createdAt: Date;
  tags: Array<{
    id: string;
    code: string;
    labelKo: string;
  }>;
};

export type CreateReviewResult = {
  reviewId: string;
  status: "pending";
  positiveContentDetected: boolean;
};

async function getSubjectForReview(
  db: ReturnType<typeof getServerDb>,
  subjectId: string
) {
  const rows = await db
    .select({
      id: subjects.id,
      slug: subjects.slug,
      name: subjects.name,
      category: subjects.category,
      status: subjects.status
    })
    .from(subjects)
    .where(and(eq(subjects.id, subjectId), ne(subjects.status, "hidden")))
    .limit(1);

  return rows[0] ?? null;
}

async function getRiskTagsForCategory(
  db: ReturnType<typeof getServerDb>,
  input: {
    category: typeof subjects.$inferSelect.category;
    riskTagIds: string[];
  }
) {
  return db
    .select({
      id: riskTags.id,
      code: riskTags.code,
      labelKo: riskTags.labelKo
    })
    .from(subjectCategoryRiskTags)
    .innerJoin(riskTags, eq(riskTags.id, subjectCategoryRiskTags.riskTagId))
    .where(
      and(
        eq(subjectCategoryRiskTags.category, input.category),
        eq(subjectCategoryRiskTags.isActive, true),
        eq(riskTags.isActive, true),
        inArray(riskTags.id, input.riskTagIds)
      )
    );
}

export async function createReview(
  rawInput: CreateReviewInput,
  actor: { userId: string; role: UserRole }
): Promise<CreateReviewResult> {
  const db = tryGetServerDb();

  if (!db) {
    throw new ReviewWriteError("database", "DATABASE_URL is required.");
  }

  const input = createReviewInputSchema.parse(rawInput);

  if (!input.authorLiabilityConfirmed) {
    throw new ReviewWriteError("liability", "Author liability is required.");
  }

  const subject = await getSubjectForReview(db, input.subjectId);

  if (!subject || subject.status !== "active") {
    throw new ReviewWriteError("subject", "Subject is not available.");
  }

  const selectedRiskTags = await getRiskTagsForCategory(db, {
    category: subject.category,
    riskTagIds: input.riskTagIds
  });

  if (selectedRiskTags.length !== input.riskTagIds.length) {
    throw new ReviewWriteError("tags", "Risk tags must match subject category.");
  }

  const complaintCheck = checkComplaintOnly({
    title: input.title,
    issueSummary: input.issueSummary,
    body: input.body,
    riskTagCount: input.riskTagIds.length,
    authorLiabilityConfirmed: input.authorLiabilityConfirmed
  });

  if (!complaintCheck.accepted) {
    await recordAnalyticsEvent(
      "positive_review_blocked",
      {
        subjectId: subject.id,
        category: subject.category,
        riskTagCount: input.riskTagIds.length
      },
      {
        actorUserId: actor.userId,
        actorRole: actor.role
      }
    ).catch((error: unknown) => {
      console.error(
        "[Xreviews analytics] Failed to record positive_review_blocked",
        error
      );
    });

    throw new ReviewWriteError("positive", POSITIVE_REVIEW_BLOCK_MESSAGE);
  }

  const isMedicalCategory = subject.category === "medical_clinic";

  if (isMedicalCategory) {
    const medicalCheck = checkMedicalGuardrail({
      title: input.title,
      issueSummary: input.issueSummary,
      body: input.body
    });

    if (!medicalCheck.accepted) {
      await recordAnalyticsEvent(
        "medical_guardrail_blocked",
        {
          subjectId: subject.id,
          category: "medical_clinic",
          riskTagCount: input.riskTagIds.length
        },
        {
          actorUserId: actor.userId,
          actorRole: actor.role
        }
      ).catch((error: unknown) => {
        console.error(
          "[Xreviews analytics] Failed to record medical_guardrail_blocked",
          error
        );
      });

      throw new ReviewWriteError("medical", MEDICAL_GUARDRAIL_MESSAGE);
    }
  }

  try {
    await ensureEvidenceAttachableToReview(input.evidenceIds, actor);
  } catch (error) {
    if (error instanceof EvidenceWriteError) {
      throw new ReviewWriteError(
        "evidence",
        "Evidence must belong to the current user and be unattached."
      );
    }

    throw error;
  }

  const reviewId = crypto.randomUUID();
  const evidenceLevel = input.evidenceIds.length > 0 ? 1 : 0;
  const reviewTagValues = input.riskTagIds.map((riskTagId) => ({
    reviewId,
    riskTagId
  }));

  const [createdRows] = await db.batch([
    db
      .insert(reviews)
      .values({
        id: reviewId,
        subjectId: subject.id,
        userId: actor.userId,
        title: input.title,
        issueSummary: input.issueSummary,
        body: input.body,
        status: "pending",
        severityScore: input.severityScore,
        evidenceLevel,
        positiveContentDetected: complaintCheck.positiveContentDetected,
        authorLiabilityConfirmed: input.authorLiabilityConfirmed,
        isMedicalCategory
      })
      .returning({
        id: reviews.id,
        status: reviews.status,
        positiveContentDetected: reviews.positiveContentDetected
      }),
    db.insert(reviewTagLinks).values(reviewTagValues),
    db.insert(auditLogs).values({
      actorUserId: actor.userId,
      actorRole: actor.role,
      action: "review_created_pending",
      targetType: "review",
      targetId: reviewId,
      metadata: {
        subjectId: subject.id,
        subjectSlug: subject.slug,
        category: subject.category,
        riskTagIds: input.riskTagIds,
        evidenceIds: input.evidenceIds,
        evidenceCount: input.evidenceIds.length,
        evidenceLevel,
        positiveContentDetected: complaintCheck.positiveContentDetected,
        isMedicalCategory,
        phase: "phase_5_evidence_upload"
      }
    })
  ]);

  const createdReview = createdRows[0];

  if (!createdReview || createdReview.status !== "pending") {
    throw new ReviewWriteError("create", "Review was not saved as pending.");
  }

  try {
    await attachEvidenceToReview(
      {
        evidenceIds: input.evidenceIds,
        reviewId: createdReview.id,
        subjectId: subject.id
      },
      actor
    );
  } catch (error) {
    if (error instanceof EvidenceWriteError) {
      throw new ReviewWriteError("evidence", "Evidence could not be attached.");
    }

    throw error;
  }

  await recordAnalyticsEvent(
    "review_submitted",
    {
      subjectId: subject.id,
      reviewId: createdReview.id,
      category: subject.category,
      status: "pending",
      riskTagCount: input.riskTagIds.length,
      evidenceCount: input.evidenceIds.length
    },
    {
      actorUserId: actor.userId,
      actorRole: actor.role
    }
  ).catch((error: unknown) => {
    console.error("[Xreviews analytics] Failed to record review_submitted", error);
  });

  return {
    reviewId: createdReview.id,
    status: "pending",
    positiveContentDetected: createdReview.positiveContentDetected
  };
}

export async function getPublishedReviewsBySubject(subjectId: string) {
  const db = tryGetServerDb();

  if (!db) {
    return [];
  }

  const reviewRows = await db
    .select({
      id: reviews.id,
      title: reviews.title,
      issueSummary: reviews.issueSummary,
      body: reviews.body,
      severityScore: reviews.severityScore,
      evidenceLevel: reviews.evidenceLevel,
      createdAt: reviews.createdAt
    })
    .from(reviews)
    .where(and(eq(reviews.subjectId, subjectId), eq(reviews.status, "published")))
    .orderBy(desc(reviews.publishedAt), desc(reviews.createdAt))
    .limit(20);

  if (reviewRows.length === 0) {
    return [];
  }

  const reviewIds = reviewRows.map((review) => review.id);
  const tagRows = await db
    .select({
      reviewId: reviewTagLinks.reviewId,
      id: riskTags.id,
      code: riskTags.code,
      labelKo: riskTags.labelKo
    })
    .from(reviewTagLinks)
    .innerJoin(riskTags, eq(riskTags.id, reviewTagLinks.riskTagId))
    .where(inArray(reviewTagLinks.reviewId, reviewIds))
    .orderBy(asc(riskTags.labelKo));

  const tagsByReviewId = new Map<string, PublicReview["tags"]>();

  for (const tag of tagRows) {
    const currentTags = tagsByReviewId.get(tag.reviewId) ?? [];
    currentTags.push({
      id: tag.id,
      code: tag.code,
      labelKo: tag.labelKo
    });
    tagsByReviewId.set(tag.reviewId, currentTags);
  }

  return reviewRows.map((review) => ({
    ...review,
    tags: tagsByReviewId.get(review.id) ?? []
  })) satisfies PublicReview[];
}
