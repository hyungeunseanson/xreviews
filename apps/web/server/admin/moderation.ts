import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  auditLogs,
  moderationCases,
  reviewEvidence,
  reviews,
  reviewTagLinks,
  riskTags,
  subjects,
  users
} from "@xreviews/db/schema";
import { CATEGORY_LABELS } from "@xreviews/shared/constants";
import { recordAnalyticsEvent } from "@/server/analytics";
import { tryGetServerDb } from "@/server/db";
import { createEvidenceReadUrl, R2ConfigurationError } from "@/server/r2";

const queueStatuses = ["pending", "disputed", "hidden", "removed"] as const;

export type AdminQueueStatus = (typeof queueStatuses)[number];
export type ReviewStatus = typeof reviews.$inferSelect.status;

type AdminActor = {
  userId: string;
  role: "admin";
};

type ModerationAction = "approve" | "dispute" | "hide" | "remove";

type ModerationInput = {
  reviewId: string;
  reason?: string;
  adminNote?: string;
};

type ModerationErrorCode =
  | "database"
  | "not_found"
  | "transition"
  | "storage"
  | "forbidden";

export class AdminModerationError extends Error {
  code: ModerationErrorCode;

  constructor(code: ModerationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function assertAdminActor(actor: AdminActor) {
  if (actor.role !== "admin") {
    throw new AdminModerationError("forbidden", "Admin role is required.");
  }
}

function getAdminDb() {
  const db = tryGetServerDb();

  if (!db) {
    throw new AdminModerationError("database", "DATABASE_URL is required.");
  }

  return db;
}

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  const safeLocal =
    local.length <= 2 ? `${local.slice(0, 1)}*` : `${local.slice(0, 2)}***`;

  return domain ? `${safeLocal}@${domain}` : safeLocal;
}

function normalizeAdminText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 1000) : undefined;
}

function getReviewActionName(nextStatus: ReviewStatus) {
  const actionByStatus = {
    published: "moderation_review_approved",
    disputed: "moderation_review_disputed",
    hidden: "moderation_review_hidden",
    removed: "moderation_review_removed"
  } as const;

  if (!(nextStatus in actionByStatus)) {
    throw new AdminModerationError("transition", "Unsupported moderation status.");
  }

  return actionByStatus[nextStatus as keyof typeof actionByStatus];
}

function getCaseStatus(nextStatus: ReviewStatus) {
  if (nextStatus === "published" || nextStatus === "removed") {
    return "resolved" as const;
  }

  return "under_review" as const;
}

function assertAllowedTransition(previousStatus: ReviewStatus, action: ModerationAction) {
  const allowed: Record<ModerationAction, ReviewStatus[]> = {
    approve: ["pending", "disputed", "hidden"],
    dispute: ["pending", "published"],
    hide: ["published", "pending", "disputed"],
    remove: ["draft", "pending", "published", "disputed", "hidden", "removed"]
  };

  if (!allowed[action].includes(previousStatus)) {
    throw new AdminModerationError(
      "transition",
      `Cannot ${action} review from ${previousStatus}.`
    );
  }
}

function getNextStatus(action: ModerationAction): ReviewStatus {
  const statusByAction: Record<ModerationAction, ReviewStatus> = {
    approve: "published",
    dispute: "disputed",
    hide: "hidden",
    remove: "removed"
  };

  return statusByAction[action];
}

async function getOrWriteModerationCase(input: {
  actor: AdminActor;
  reviewId: string;
  subjectId: string;
  action: ModerationAction;
  nextStatus: ReviewStatus;
  reason?: string;
  adminNote?: string;
}) {
  const db = getAdminDb();
  const caseStatus = getCaseStatus(input.nextStatus);
  const reason = input.reason ?? input.action;
  const decision = input.adminNote ?? null;
  const [existingCase] = await db
    .select({
      id: moderationCases.id,
      status: moderationCases.status
    })
    .from(moderationCases)
    .where(eq(moderationCases.reviewId, input.reviewId))
    .orderBy(desc(moderationCases.createdAt))
    .limit(1);

  if (existingCase && !["resolved", "rejected"].includes(existingCase.status)) {
    const [updatedCase] = await db
      .update(moderationCases)
      .set({
        subjectId: input.subjectId,
        assignedAdminUserId: input.actor.userId,
        reason,
        status: caseStatus,
        decision,
        updatedAt: new Date()
      })
      .where(eq(moderationCases.id, existingCase.id))
      .returning({
        id: moderationCases.id,
        status: moderationCases.status
      });

    await db.insert(auditLogs).values({
      actorUserId: input.actor.userId,
      actorRole: "admin",
      action: "moderation_case_updated",
      targetType: "moderation_case",
      targetId: updatedCase?.id ?? existingCase.id,
      metadata: {
        reviewId: input.reviewId,
        subjectId: input.subjectId,
        moderationCaseId: updatedCase?.id ?? existingCase.id,
        reason,
        adminNoteProvided: Boolean(input.adminNote),
        nextStatus: input.nextStatus,
        phase: "phase_6_admin_moderation"
      }
    });

    return {
      id: updatedCase?.id ?? existingCase.id,
      mode: "updated" as const
    };
  }

  const moderationCaseId = crypto.randomUUID();
  const [createdCase] = await db
    .insert(moderationCases)
    .values({
      id: moderationCaseId,
      reviewId: input.reviewId,
      subjectId: input.subjectId,
      openedByUserId: input.actor.userId,
      assignedAdminUserId: input.actor.userId,
      reason,
      status: caseStatus,
      decision
    })
    .returning({
      id: moderationCases.id
    });

  await db.insert(auditLogs).values({
    actorUserId: input.actor.userId,
    actorRole: "admin",
    action: "moderation_case_created",
    targetType: "moderation_case",
    targetId: createdCase?.id ?? moderationCaseId,
    metadata: {
      reviewId: input.reviewId,
      subjectId: input.subjectId,
      moderationCaseId: createdCase?.id ?? moderationCaseId,
      reason,
      adminNoteProvided: Boolean(input.adminNote),
      nextStatus: input.nextStatus,
      phase: "phase_6_admin_moderation"
    }
  });

  return {
    id: createdCase?.id ?? moderationCaseId,
    mode: "created" as const
  };
}

export function getAdminQueueStatus(value: unknown): AdminQueueStatus {
  return queueStatuses.includes(value as AdminQueueStatus)
    ? (value as AdminQueueStatus)
    : "pending";
}

export function getQueueStatuses() {
  return queueStatuses;
}

export async function getAdminReviewQueue(input: {
  status: AdminQueueStatus;
}) {
  const db = getAdminDb();
  const [reviewRows, countRows] = await Promise.all([
    db
      .select({
        id: reviews.id,
        title: reviews.title,
        issueSummary: reviews.issueSummary,
        status: reviews.status,
        severityScore: reviews.severityScore,
        positiveContentDetected: reviews.positiveContentDetected,
        isMedicalCategory: reviews.isMedicalCategory,
        createdAt: reviews.createdAt,
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        subjectCategory: subjects.category,
        authorEmail: users.email,
        authorUserId: users.id
      })
      .from(reviews)
      .innerJoin(subjects, eq(subjects.id, reviews.subjectId))
      .innerJoin(users, eq(users.id, reviews.userId))
      .where(eq(reviews.status, input.status))
      .orderBy(desc(reviews.createdAt))
      .limit(100),
    db
      .select({
        status: reviews.status,
        count: sql<number>`count(*)::int`
      })
      .from(reviews)
      .where(inArray(reviews.status, queueStatuses))
      .groupBy(reviews.status)
  ]);

  const reviewIds = reviewRows.map((review) => review.id);
  const [evidenceCountRows, tagRows] =
    reviewIds.length > 0
      ? await Promise.all([
          db
            .select({
              reviewId: reviewEvidence.reviewId,
              count: sql<number>`count(${reviewEvidence.id})::int`
            })
            .from(reviewEvidence)
            .where(inArray(reviewEvidence.reviewId, reviewIds))
            .groupBy(reviewEvidence.reviewId),
          db
            .select({
              reviewId: reviewTagLinks.reviewId,
              labelKo: riskTags.labelKo
            })
            .from(reviewTagLinks)
            .innerJoin(riskTags, eq(riskTags.id, reviewTagLinks.riskTagId))
            .where(inArray(reviewTagLinks.reviewId, reviewIds))
            .orderBy(asc(riskTags.labelKo))
        ])
      : [[], []];

  const counts = Object.fromEntries(queueStatuses.map((status) => [status, 0])) as
    Record<AdminQueueStatus, number>;

  for (const row of countRows) {
    if (queueStatuses.includes(row.status as AdminQueueStatus)) {
      counts[row.status as AdminQueueStatus] = row.count;
    }
  }

  const evidenceCountByReviewId = new Map(
    evidenceCountRows.map((row) => [row.reviewId, row.count])
  );
  const tagsByReviewId = new Map<string, string[]>();

  for (const tag of tagRows) {
    tagsByReviewId.set(tag.reviewId, [
      ...(tagsByReviewId.get(tag.reviewId) ?? []),
      tag.labelKo
    ]);
  }

  return {
    counts,
    items: reviewRows.map((review) => ({
      ...review,
      subjectCategoryLabel: CATEGORY_LABELS[review.subjectCategory],
      authorLabel: `${maskEmail(review.authorEmail)} · ${review.authorUserId.slice(0, 8)}`,
      evidenceCount: evidenceCountByReviewId.get(review.id) ?? 0,
      riskTags: tagsByReviewId.get(review.id) ?? []
    }))
  };
}

export async function getAdminReviewDetail(reviewId: string) {
  const db = getAdminDb();
  const [reviewRow] = await db
    .select({
      id: reviews.id,
      title: reviews.title,
      issueSummary: reviews.issueSummary,
      body: reviews.body,
      status: reviews.status,
      severityScore: reviews.severityScore,
      evidenceLevel: reviews.evidenceLevel,
      positiveContentDetected: reviews.positiveContentDetected,
      authorLiabilityConfirmed: reviews.authorLiabilityConfirmed,
      isMedicalCategory: reviews.isMedicalCategory,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      publishedAt: reviews.publishedAt,
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      subjectCategory: subjects.category,
      authorUserId: users.id,
      authorEmail: users.email
    })
    .from(reviews)
    .innerJoin(subjects, eq(subjects.id, reviews.subjectId))
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!reviewRow) {
    return null;
  }

  const [tagRows, evidenceRows, moderationCaseRows, auditRows] =
    await Promise.all([
      db
        .select({
          id: riskTags.id,
          code: riskTags.code,
          labelKo: riskTags.labelKo
        })
        .from(reviewTagLinks)
        .innerJoin(riskTags, eq(riskTags.id, reviewTagLinks.riskTagId))
        .where(eq(reviewTagLinks.reviewId, reviewId))
        .orderBy(asc(riskTags.labelKo)),
      db
        .select({
          id: reviewEvidence.id,
          evidenceType: reviewEvidence.evidenceType,
          fileName: reviewEvidence.fileName,
          fileType: reviewEvidence.fileType,
          fileSizeBytes: reviewEvidence.fileSizeBytes,
          createdAt: reviewEvidence.createdAt
        })
        .from(reviewEvidence)
        .where(eq(reviewEvidence.reviewId, reviewId))
        .orderBy(desc(reviewEvidence.createdAt)),
      db
        .select({
          id: moderationCases.id,
          reason: moderationCases.reason,
          status: moderationCases.status,
          decision: moderationCases.decision,
          createdAt: moderationCases.createdAt,
          updatedAt: moderationCases.updatedAt
        })
        .from(moderationCases)
        .where(eq(moderationCases.reviewId, reviewId))
        .orderBy(desc(moderationCases.createdAt))
        .limit(10),
      db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.createdAt
        })
        .from(auditLogs)
        .where(eq(auditLogs.targetId, reviewId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(12)
    ]);

  return {
    ...reviewRow,
    subjectCategoryLabel: CATEGORY_LABELS[reviewRow.subjectCategory],
    authorLabel: `${maskEmail(reviewRow.authorEmail)} · ${reviewRow.authorUserId.slice(0, 8)}`,
    riskTags: tagRows,
    evidence: evidenceRows,
    moderationCases: moderationCaseRows,
    auditLogs: auditRows
  };
}

export async function updateReviewModerationStatus(
  action: ModerationAction,
  input: ModerationInput,
  actor: AdminActor
) {
  assertAdminActor(actor);
  const db = getAdminDb();
  const [currentReview] = await db
    .select({
      id: reviews.id,
      status: reviews.status,
      subjectId: reviews.subjectId
    })
    .from(reviews)
    .where(eq(reviews.id, input.reviewId))
    .limit(1);

  if (!currentReview) {
    throw new AdminModerationError("not_found", "Review not found.");
  }

  const previousStatus = currentReview.status;
  assertAllowedTransition(previousStatus, action);
  const nextStatus = getNextStatus(action);
  const reason = normalizeAdminText(input.reason) ?? action;
  const adminNote = normalizeAdminText(input.adminNote);
  const moderationCase = await getOrWriteModerationCase({
    actor,
    reviewId: currentReview.id,
    subjectId: currentReview.subjectId,
    action,
    nextStatus,
    reason,
    adminNote
  });

  const [updatedReview] = await db
    .update(reviews)
    .set({
      status: nextStatus,
      publishedAt: nextStatus === "published" ? new Date() : currentReview.status === "published" ? null : undefined,
      updatedAt: new Date()
    })
    .where(eq(reviews.id, currentReview.id))
    .returning({
      id: reviews.id,
      status: reviews.status
    });

  if (!updatedReview) {
    throw new AdminModerationError("not_found", "Review update failed.");
  }

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: "admin",
    action: getReviewActionName(nextStatus),
    targetType: "review",
    targetId: currentReview.id,
    metadata: {
      reviewId: currentReview.id,
      subjectId: currentReview.subjectId,
      previousStatus,
      nextStatus,
      moderationCaseId: moderationCase.id,
      moderationCaseMode: moderationCase.mode,
      reason,
      adminNoteProvided: Boolean(adminNote),
      phase: "phase_6_admin_moderation"
    }
  });

  await recordAnalyticsEvent(
    "moderation_action_taken",
    {
      reviewId: currentReview.id,
      subjectId: currentReview.subjectId,
      previousStatus,
      nextStatus,
      action
    },
    {
      actorUserId: actor.userId,
      actorRole: "admin"
    }
  ).catch((error: unknown) => {
    console.error(
      "[Xreviews analytics] Failed to record moderation_action_taken",
      error
    );
  });

  return {
    reviewId: updatedReview.id,
    previousStatus,
    nextStatus,
    moderationCaseId: moderationCase.id
  };
}

export async function getAdminEvidenceSignedReadUrl(input: {
  reviewId: string;
  evidenceId: string;
  actor: AdminActor;
}) {
  assertAdminActor(input.actor);
  const db = getAdminDb();
  const [evidence] = await db
    .select({
      id: reviewEvidence.id,
      reviewId: reviewEvidence.reviewId,
      evidenceType: reviewEvidence.evidenceType,
      fileName: reviewEvidence.fileName,
      fileType: reviewEvidence.fileType,
      fileSizeBytes: reviewEvidence.fileSizeBytes,
      r2ObjectKey: reviewEvidence.r2ObjectKey,
      subjectId: reviews.subjectId
    })
    .from(reviewEvidence)
    .innerJoin(reviews, eq(reviews.id, reviewEvidence.reviewId))
    .where(eq(reviewEvidence.id, input.evidenceId))
    .limit(1);

  if (!evidence || evidence.reviewId !== input.reviewId) {
    throw new AdminModerationError("not_found", "Evidence not found.");
  }

  try {
    const { readUrl, expiresInSeconds } = await createEvidenceReadUrl({
      objectKey: evidence.r2ObjectKey,
      fileName: evidence.fileName
    });

    await db.insert(auditLogs).values({
      actorUserId: input.actor.userId,
      actorRole: "admin",
      action: "moderation_evidence_view_requested",
      targetType: "evidence",
      targetId: evidence.id,
      metadata: {
        reviewId: input.reviewId,
        subjectId: evidence.subjectId,
        evidenceId: evidence.id,
        evidenceType: evidence.evidenceType,
        fileType: evidence.fileType,
        fileSizeBytes: evidence.fileSizeBytes,
        expiresInSeconds,
        phase: "phase_6_admin_moderation"
      }
    });

    return {
      readUrl,
      expiresInSeconds
    };
  } catch (error) {
    if (error instanceof R2ConfigurationError) {
      throw new AdminModerationError("storage", "R2 settings are required.");
    }

    throw error;
  }
}
