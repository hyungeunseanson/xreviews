import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  auditLogs,
  businessClaims,
  businessImprovementPosts,
  businessProfiles,
  businessResponses,
  businessSubscriptions,
  reviews,
  subjects,
  users
} from "@xreviews/db/schema";
import {
  BUSINESS_IMPROVEMENT_CATEGORY_LABELS,
  BUSINESS_PLAN_LABELS,
  BUSINESS_PLAN_PRICES,
  BUSINESS_RESPONSE_TYPE_LABELS,
  CATEGORY_LABELS
} from "@xreviews/shared/constants";
import {
  adminBusinessClaimActionInputSchema,
  createBusinessClaimInputSchema,
  createBusinessImprovementPostInputSchema,
  updateBusinessImprovementPostInputSchema,
  upsertBusinessResponseInputSchema,
  type BusinessClaimStatus,
  type BusinessImprovementCategory,
  type BusinessResponseType,
  type BusinessSubscriptionPlan
} from "@xreviews/validators";
import { recordAnalyticsEvent } from "@/server/analytics";
import { tryGetServerDb } from "@/server/db";
import type { UserRole } from "@/server/session";

const claimStatuses = ["pending", "approved", "rejected", "revoked"] as const;

export type { BusinessClaimStatus };

type Actor = {
  userId: string;
  role: UserRole;
};

type AdminActor = {
  userId: string;
  role: "admin";
};

type BusinessErrorCode =
  | "database"
  | "invalid"
  | "not_found"
  | "forbidden"
  | "duplicate"
  | "transition"
  | "review";

export class BusinessError extends Error {
  code: BusinessErrorCode;

  constructor(code: BusinessErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function getBusinessDb() {
  const db = tryGetServerDb();

  if (!db) {
    throw new BusinessError("database", "DATABASE_URL is required.");
  }

  return db;
}

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  const safeLocal =
    local.length <= 2 ? `${local.slice(0, 1)}*` : `${local.slice(0, 2)}***`;

  return domain ? `${safeLocal}@${domain}` : safeLocal;
}

function normalizeAdminNote(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 1000) : null;
}

function assertAdmin(actor: Actor): asserts actor is AdminActor {
  if (actor.role !== "admin") {
    throw new BusinessError("forbidden", "Admin role is required.");
  }
}

function getClaimActionName(nextStatus: BusinessClaimStatus) {
  const actionByStatus = {
    approved: "business_claim_approved",
    rejected: "business_claim_rejected",
    revoked: "business_claim_revoked",
    pending: "business_claim_pending"
  } as const;

  return actionByStatus[nextStatus];
}

function assertClaimTransition(
  previousStatus: BusinessClaimStatus,
  nextStatus: BusinessClaimStatus
) {
  const allowed: Record<BusinessClaimStatus, BusinessClaimStatus[]> = {
    pending: ["approved", "rejected"],
    approved: ["revoked"],
    rejected: ["approved"],
    revoked: ["approved"]
  };

  if (!allowed[previousStatus]?.includes(nextStatus)) {
    throw new BusinessError(
      "transition",
      `Cannot move business claim from ${previousStatus} to ${nextStatus}.`
    );
  }
}

async function getApprovedBusinessProfileForActor(
  db: ReturnType<typeof getBusinessDb>,
  subjectId: string,
  actor: Actor
) {
  const [profile] = await db
    .select({
      id: businessProfiles.id,
      subjectId: businessProfiles.subjectId,
      ownerUserId: businessProfiles.ownerUserId,
      officialDisplayName: businessProfiles.officialDisplayName,
      officialBadgeEnabled: businessProfiles.officialBadgeEnabled
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.subjectId, subjectId))
    .limit(1);

  if (!profile) {
    throw new BusinessError("forbidden", "Approved business profile is required.");
  }

  if (actor.role === "admin") {
    return profile;
  }

  if (actor.role !== "business" || profile.ownerUserId !== actor.userId) {
    throw new BusinessError("forbidden", "Business profile ownership is required.");
  }

  const [approvedClaim] = await db
    .select({ id: businessClaims.id })
    .from(businessClaims)
    .where(
      and(
        eq(businessClaims.subjectId, subjectId),
        eq(businessClaims.userId, actor.userId),
        eq(businessClaims.status, "approved")
      )
    )
    .limit(1);

  if (!approvedClaim || !profile.officialBadgeEnabled) {
    throw new BusinessError("forbidden", "Approved business claim is required.");
  }

  return profile;
}

export function getBusinessClaimStatus(value: unknown): BusinessClaimStatus {
  return claimStatuses.includes(value as BusinessClaimStatus)
    ? (value as BusinessClaimStatus)
    : "pending";
}

export function getBusinessClaimStatuses() {
  return claimStatuses;
}

export async function getBusinessClaimStateForSubject(input: {
  subjectId: string;
  userId: string;
}) {
  const db = getBusinessDb();
  const [approvedProfile] = await db
    .select({
      id: businessProfiles.id,
      officialDisplayName: businessProfiles.officialDisplayName,
      officialBadgeEnabled: businessProfiles.officialBadgeEnabled
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.subjectId, input.subjectId))
    .limit(1);
  const [userClaim] = await db
    .select({
      id: businessClaims.id,
      status: businessClaims.status,
      businessName: businessClaims.businessName,
      createdAt: businessClaims.createdAt
    })
    .from(businessClaims)
    .where(
      and(
        eq(businessClaims.subjectId, input.subjectId),
        eq(businessClaims.userId, input.userId)
      )
    )
    .orderBy(desc(businessClaims.createdAt))
    .limit(1);

  return {
    approvedProfile,
    userClaim
  };
}

export async function submitBusinessClaim(rawInput: unknown, actor: Actor) {
  const db = getBusinessDb();
  const input = createBusinessClaimInputSchema.parse(rawInput);
  const [subject] = await db
    .select({
      id: subjects.id,
      name: subjects.name,
      category: subjects.category,
      status: subjects.status
    })
    .from(subjects)
    .where(eq(subjects.id, input.subjectId))
    .limit(1);

  if (!subject || subject.status !== "active") {
    throw new BusinessError("not_found", "Active subject is required.");
  }

  const [approvedProfile] = await db
    .select({
      id: businessProfiles.id,
      officialBadgeEnabled: businessProfiles.officialBadgeEnabled
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.subjectId, input.subjectId))
    .limit(1);

  if (approvedProfile?.officialBadgeEnabled) {
    throw new BusinessError("duplicate", "This subject already has an official account.");
  }

  const [existingClaim] = await db
    .select({ id: businessClaims.id, status: businessClaims.status })
    .from(businessClaims)
    .where(
      and(
        eq(businessClaims.subjectId, input.subjectId),
        eq(businessClaims.userId, actor.userId),
        inArray(businessClaims.status, ["pending", "approved"])
      )
    )
    .limit(1);

  if (existingClaim) {
    throw new BusinessError("duplicate", "A claim already exists for this subject.");
  }

  const [createdClaim] = await db
    .insert(businessClaims)
    .values({
      subjectId: input.subjectId,
      userId: actor.userId,
      businessName: input.businessName,
      applicantName: input.applicantName,
      registrationNumber: input.registrationNumber,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      verificationNote: input.verificationNote,
      status: "pending"
    })
    .returning({
      id: businessClaims.id,
      status: businessClaims.status
    });

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "business_claim_submitted",
    targetType: "business_claim",
    targetId: createdClaim.id,
    metadata: {
      subjectId: input.subjectId,
      businessClaimId: createdClaim.id,
      businessName: input.businessName,
      phase: "phase_7_business"
    }
  });

  await recordAnalyticsEvent(
    "business_claim_submitted",
    {
      subjectId: input.subjectId,
      category: subject.category,
      status: createdClaim.status
    },
    {
      actorUserId: actor.userId,
      actorRole: actor.role
    }
  ).catch((error: unknown) => {
    console.error(
      "[Xreviews analytics] Failed to record business_claim_submitted",
      error
    );
  });

  return createdClaim;
}

export async function getAdminBusinessClaimQueue(input: {
  status: BusinessClaimStatus;
}) {
  const db = getBusinessDb();
  const [claimRows, countRows] = await Promise.all([
    db
      .select({
        id: businessClaims.id,
        status: businessClaims.status,
        businessName: businessClaims.businessName,
        applicantName: businessClaims.applicantName,
        contactEmail: businessClaims.contactEmail,
        contactPhone: businessClaims.contactPhone,
        createdAt: businessClaims.createdAt,
        subjectId: subjects.id,
        subjectName: subjects.name,
        subjectSlug: subjects.slug,
        subjectCategory: subjects.category,
        userId: users.id,
        userEmail: users.email
      })
      .from(businessClaims)
      .innerJoin(subjects, eq(subjects.id, businessClaims.subjectId))
      .innerJoin(users, eq(users.id, businessClaims.userId))
      .where(eq(businessClaims.status, input.status))
      .orderBy(desc(businessClaims.createdAt))
      .limit(100),
    db
      .select({
        status: businessClaims.status,
        count: sql<number>`count(*)::int`
      })
      .from(businessClaims)
      .groupBy(businessClaims.status)
  ]);

  const counts = Object.fromEntries(claimStatuses.map((status) => [status, 0])) as
    Record<BusinessClaimStatus, number>;

  for (const row of countRows) {
    counts[row.status] = row.count;
  }

  return {
    counts,
    items: claimRows.map((claim) => ({
      ...claim,
      subjectCategoryLabel: CATEGORY_LABELS[claim.subjectCategory],
      requesterLabel: `${maskEmail(claim.userEmail)} · ${claim.userId.slice(0, 8)}`
    }))
  };
}

export async function getAdminBusinessClaimDetail(claimId: string) {
  const db = getBusinessDb();
  const [claim] = await db
    .select({
      id: businessClaims.id,
      status: businessClaims.status,
      businessName: businessClaims.businessName,
      applicantName: businessClaims.applicantName,
      registrationNumber: businessClaims.registrationNumber,
      contactEmail: businessClaims.contactEmail,
      contactPhone: businessClaims.contactPhone,
      verificationNote: businessClaims.verificationNote,
      adminNote: businessClaims.adminNote,
      createdAt: businessClaims.createdAt,
      updatedAt: businessClaims.updatedAt,
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      subjectCategory: subjects.category,
      userId: users.id,
      userEmail: users.email,
      userRole: users.role
    })
    .from(businessClaims)
    .innerJoin(subjects, eq(subjects.id, businessClaims.subjectId))
    .innerJoin(users, eq(users.id, businessClaims.userId))
    .where(eq(businessClaims.id, claimId))
    .limit(1);

  if (!claim) {
    return null;
  }

  const [profile, auditRows] = await Promise.all([
    db
      .select({
        id: businessProfiles.id,
        ownerUserId: businessProfiles.ownerUserId,
        officialDisplayName: businessProfiles.officialDisplayName,
        officialBadgeEnabled: businessProfiles.officialBadgeEnabled
      })
      .from(businessProfiles)
      .where(eq(businessProfiles.subjectId, claim.subjectId))
      .limit(1),
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt
      })
      .from(auditLogs)
      .where(eq(auditLogs.targetId, claimId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(12)
  ]);

  return {
    ...claim,
    subjectCategoryLabel: CATEGORY_LABELS[claim.subjectCategory],
    requesterLabel: `${maskEmail(claim.userEmail)} · ${claim.userId.slice(0, 8)}`,
    profile: profile[0] ?? null,
    auditLogs: auditRows
  };
}

export async function updateBusinessClaimStatus(
  nextStatus: Exclude<BusinessClaimStatus, "pending">,
  rawInput: unknown,
  actor: Actor
) {
  assertAdmin(actor);
  const db = getBusinessDb();
  const input = adminBusinessClaimActionInputSchema.parse(rawInput);
  const [claim] = await db
    .select({
      id: businessClaims.id,
      status: businessClaims.status,
      subjectId: businessClaims.subjectId,
      userId: businessClaims.userId,
      businessName: businessClaims.businessName,
      adminNote: businessClaims.adminNote
    })
    .from(businessClaims)
    .where(eq(businessClaims.id, input.claimId))
    .limit(1);

  if (!claim) {
    throw new BusinessError("not_found", "Business claim not found.");
  }

  assertClaimTransition(claim.status, nextStatus);
  const adminNote = normalizeAdminNote(input.adminNote);
  const previousStatus = claim.status;
  const [updatedClaim] = await db
    .update(businessClaims)
    .set({
      status: nextStatus,
      adminNote,
      updatedAt: new Date()
    })
    .where(eq(businessClaims.id, claim.id))
    .returning({
      id: businessClaims.id,
      status: businessClaims.status
    });

  let businessProfileId: string | null = null;

  if (nextStatus === "approved") {
    const [existingProfile] = await db
      .select({
        id: businessProfiles.id,
        ownerUserId: businessProfiles.ownerUserId
      })
      .from(businessProfiles)
      .where(eq(businessProfiles.subjectId, claim.subjectId))
      .limit(1);

    if (existingProfile) {
      const [profile] = await db
        .update(businessProfiles)
        .set({
          ownerUserId: claim.userId,
          officialDisplayName: claim.businessName,
          officialBadgeEnabled: true,
          updatedAt: new Date()
        })
        .where(eq(businessProfiles.id, existingProfile.id))
        .returning({ id: businessProfiles.id });

      businessProfileId = profile.id;
    } else {
      const [profile] = await db
        .insert(businessProfiles)
        .values({
          subjectId: claim.subjectId,
          ownerUserId: claim.userId,
          officialDisplayName: claim.businessName,
          officialBadgeEnabled: true
        })
        .returning({ id: businessProfiles.id });

      businessProfileId = profile.id;

      await db.insert(auditLogs).values({
        actorUserId: actor.userId,
        actorRole: "admin",
        action: "business_profile_created",
        targetType: "business_profile",
        targetId: businessProfileId,
        metadata: {
          subjectId: claim.subjectId,
          businessClaimId: claim.id,
          businessProfileId,
          actorUserId: actor.userId,
          phase: "phase_7_business"
        }
      });
    }

    const [claimUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, claim.userId))
      .limit(1);

    if (claimUser && claimUser.role === "user") {
      await db
        .update(users)
        .set({ role: "business", updatedAt: new Date() })
        .where(eq(users.id, claim.userId));
    }

    const [existingSubscription] = await db
      .select({ id: businessSubscriptions.id })
      .from(businessSubscriptions)
      .where(eq(businessSubscriptions.businessProfileId, businessProfileId))
      .limit(1);

    if (!existingSubscription) {
      await db.insert(businessSubscriptions).values({
        businessProfileId,
        plan: "free_claim",
        status: "active",
        startedAt: new Date()
      });

      await db.insert(auditLogs).values({
        actorUserId: actor.userId,
        actorRole: "admin",
        action: "business_subscription_skeleton_selected",
        targetType: "business_profile",
        targetId: businessProfileId,
        metadata: {
          subjectId: claim.subjectId,
          businessClaimId: claim.id,
          businessProfileId,
          plan: "free_claim",
          phase: "phase_7_business"
        }
      });
    }
  }

  if (nextStatus === "revoked") {
    const [profile] = await db
      .update(businessProfiles)
      .set({
        officialBadgeEnabled: false,
        updatedAt: new Date()
      })
      .where(eq(businessProfiles.subjectId, claim.subjectId))
      .returning({ id: businessProfiles.id });

    businessProfileId = profile?.id ?? null;
  }

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: "admin",
    action: getClaimActionName(nextStatus),
    targetType: "business_claim",
    targetId: updatedClaim.id,
    metadata: {
      subjectId: claim.subjectId,
      businessClaimId: claim.id,
      businessProfileId,
      actorUserId: actor.userId,
      previousStatus,
      nextStatus,
      adminNoteProvided: Boolean(adminNote),
      phase: "phase_7_business"
    }
  });

  return {
    claimId: updatedClaim.id,
    previousStatus,
    nextStatus,
    businessProfileId
  };
}

export async function getBusinessSubjectsForActor(actor: Actor) {
  const db = getBusinessDb();
  const baseQuery = db
    .select({
      profileId: businessProfiles.id,
      officialDisplayName: businessProfiles.officialDisplayName,
      officialBadgeEnabled: businessProfiles.officialBadgeEnabled,
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      subjectCategory: subjects.category,
      subscriptionPlan: businessSubscriptions.plan,
      subscriptionStatus: businessSubscriptions.status
    })
    .from(businessProfiles)
    .innerJoin(subjects, eq(subjects.id, businessProfiles.subjectId))
    .leftJoin(
      businessSubscriptions,
      eq(businessSubscriptions.businessProfileId, businessProfiles.id)
    )
    .orderBy(desc(businessProfiles.createdAt));

  const rows =
    actor.role === "admin"
      ? await baseQuery
      : await baseQuery.where(
          and(
            eq(businessProfiles.ownerUserId, actor.userId),
            eq(businessProfiles.officialBadgeEnabled, true)
          )
        );

  return rows.map((row) => ({
    ...row,
    subjectCategoryLabel: CATEGORY_LABELS[row.subjectCategory],
    subscriptionPlanLabel: row.subscriptionPlan
      ? BUSINESS_PLAN_LABELS[row.subscriptionPlan]
      : BUSINESS_PLAN_LABELS.free_claim
  }));
}

export async function getBusinessSubjectDashboard(
  subjectId: string,
  actor: Actor
) {
  const db = getBusinessDb();
  const profile = await getApprovedBusinessProfileForActor(db, subjectId, actor);
  const [subjectRow, reviewRows, responseRows, improvementRows, subscriptionRows] =
    await Promise.all([
      db
        .select({
          id: subjects.id,
          name: subjects.name,
          slug: subjects.slug,
          category: subjects.category
        })
        .from(subjects)
        .where(eq(subjects.id, subjectId))
        .limit(1),
      db
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
        .limit(50),
      db
        .select({
          id: businessResponses.id,
          reviewId: businessResponses.reviewId,
          body: businessResponses.body,
          responseType: businessResponses.responseType,
          updatedAt: businessResponses.updatedAt
        })
        .from(businessResponses)
        .where(eq(businessResponses.businessProfileId, profile.id))
        .orderBy(desc(businessResponses.updatedAt)),
      db
        .select({
          id: businessImprovementPosts.id,
          title: businessImprovementPosts.title,
          body: businessImprovementPosts.body,
          category: businessImprovementPosts.category,
          updatedAt: businessImprovementPosts.updatedAt
        })
        .from(businessImprovementPosts)
        .where(
          and(
            eq(businessImprovementPosts.businessProfileId, profile.id),
            eq(businessImprovementPosts.status, "published")
          )
        )
        .orderBy(desc(businessImprovementPosts.updatedAt))
        .limit(20),
      db
        .select({
          plan: businessSubscriptions.plan,
          status: businessSubscriptions.status
        })
        .from(businessSubscriptions)
        .where(eq(businessSubscriptions.businessProfileId, profile.id))
        .limit(1)
    ]);

  const subject = subjectRow[0];

  if (!subject) {
    throw new BusinessError("not_found", "Subject not found.");
  }

  const responsesByReviewId = new Map<
    string,
    {
      id: string;
      body: string;
      responseType: BusinessResponseType;
      responseTypeLabel: string;
      updatedAt: Date;
    }
  >();

  for (const response of responseRows) {
    if (!responsesByReviewId.has(response.reviewId)) {
      responsesByReviewId.set(response.reviewId, {
        ...response,
        responseTypeLabel: BUSINESS_RESPONSE_TYPE_LABELS[response.responseType]
      });
    }
  }

  return {
    subject: {
      ...subject,
      categoryLabel: CATEGORY_LABELS[subject.category]
    },
    profile,
    reviews: reviewRows.map((review) => ({
      ...review,
      response: responsesByReviewId.get(review.id) ?? null
    })),
    improvementPosts: improvementRows.map((post) => ({
      ...post,
      category: post.category as BusinessImprovementCategory,
      categoryLabel:
        BUSINESS_IMPROVEMENT_CATEGORY_LABELS[
          post.category as BusinessImprovementCategory
        ] ?? BUSINESS_IMPROVEMENT_CATEGORY_LABELS.other
    })),
    subscription: subscriptionRows[0] ?? {
      plan: "free_claim" as BusinessSubscriptionPlan,
      status: "active"
    }
  };
}

export async function upsertBusinessResponse(rawInput: unknown, actor: Actor) {
  const db = getBusinessDb();
  const input = upsertBusinessResponseInputSchema.parse(rawInput);
  const [review] = await db
    .select({
      id: reviews.id,
      subjectId: reviews.subjectId,
      status: reviews.status
    })
    .from(reviews)
    .where(eq(reviews.id, input.reviewId))
    .limit(1);

  if (!review || review.status !== "published") {
    throw new BusinessError("review", "Business responses require a published review.");
  }

  const profile = await getApprovedBusinessProfileForActor(
    db,
    review.subjectId,
    actor
  );
  const [existingResponse] = await db
    .select({ id: businessResponses.id })
    .from(businessResponses)
    .where(
      and(
        eq(businessResponses.reviewId, review.id),
        eq(businessResponses.businessProfileId, profile.id)
      )
    )
    .limit(1);

  if (existingResponse) {
    await db
      .update(businessResponses)
      .set({
        body: input.body,
        responseType: input.responseType,
        status: "published",
        updatedAt: new Date()
      })
      .where(eq(businessResponses.id, existingResponse.id));

    await db.insert(auditLogs).values({
      actorUserId: actor.userId,
      actorRole: actor.role,
      action: "business_response_updated",
      targetType: "business_response",
      targetId: existingResponse.id,
      metadata: {
        subjectId: review.subjectId,
        businessProfileId: profile.id,
        reviewId: review.id,
        actorUserId: actor.userId,
        responseType: input.responseType,
        phase: "phase_7_business"
      }
    });

    return { id: existingResponse.id, mode: "updated" as const };
  }

  const [createdResponse] = await db
    .insert(businessResponses)
    .values({
      reviewId: review.id,
      businessProfileId: profile.id,
      body: input.body,
      responseType: input.responseType,
      status: "published"
    })
    .returning({ id: businessResponses.id });

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "business_response_created",
    targetType: "business_response",
    targetId: createdResponse.id,
    metadata: {
      subjectId: review.subjectId,
      businessProfileId: profile.id,
      reviewId: review.id,
      actorUserId: actor.userId,
      responseType: input.responseType,
      phase: "phase_7_business"
    }
  });

  await recordAnalyticsEvent(
    "business_response_created",
    {
      subjectId: review.subjectId,
      reviewId: review.id
    },
    {
      actorUserId: actor.userId,
      actorRole: actor.role
    }
  ).catch((error: unknown) => {
    console.error(
      "[Xreviews analytics] Failed to record business_response_created",
      error
    );
  });

  return { id: createdResponse.id, mode: "created" as const };
}

export async function createBusinessImprovementPost(
  rawInput: unknown,
  actor: Actor
) {
  const db = getBusinessDb();
  const input = createBusinessImprovementPostInputSchema.parse(rawInput);
  const profile = await getApprovedBusinessProfileForActor(
    db,
    input.subjectId,
    actor
  );
  const [createdPost] = await db
    .insert(businessImprovementPosts)
    .values({
      subjectId: input.subjectId,
      businessProfileId: profile.id,
      title: input.title,
      body: input.body,
      category: input.category,
      status: "published"
    })
    .returning({ id: businessImprovementPosts.id });

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "business_improvement_post_created",
    targetType: "business_improvement_post",
    targetId: createdPost.id,
    metadata: {
      subjectId: input.subjectId,
      businessProfileId: profile.id,
      actorUserId: actor.userId,
      category: input.category,
      phase: "phase_7_business"
    }
  });

  await recordAnalyticsEvent(
    "business_improvement_post_created",
    {
      subjectId: input.subjectId,
      category: input.category
    },
    {
      actorUserId: actor.userId,
      actorRole: actor.role
    }
  ).catch((error: unknown) => {
    console.error(
      "[Xreviews analytics] Failed to record business_improvement_post_created",
      error
    );
  });

  return createdPost;
}

export async function updateBusinessImprovementPost(
  rawInput: unknown,
  actor: Actor
) {
  const db = getBusinessDb();
  const input = updateBusinessImprovementPostInputSchema.parse(rawInput);
  const [post] = await db
    .select({
      id: businessImprovementPosts.id,
      subjectId: businessImprovementPosts.subjectId,
      businessProfileId: businessImprovementPosts.businessProfileId
    })
    .from(businessImprovementPosts)
    .where(eq(businessImprovementPosts.id, input.postId))
    .limit(1);

  if (!post) {
    throw new BusinessError("not_found", "Improvement post not found.");
  }

  const profile = await getApprovedBusinessProfileForActor(
    db,
    post.subjectId,
    actor
  );

  if (profile.id !== post.businessProfileId) {
    throw new BusinessError("forbidden", "Business profile ownership is required.");
  }

  await db
    .update(businessImprovementPosts)
    .set({
      title: input.title,
      body: input.body,
      category: input.category,
      updatedAt: new Date()
    })
    .where(eq(businessImprovementPosts.id, post.id));

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "business_improvement_post_updated",
    targetType: "business_improvement_post",
    targetId: post.id,
    metadata: {
      subjectId: post.subjectId,
      businessProfileId: profile.id,
      actorUserId: actor.userId,
      category: input.category,
      phase: "phase_7_business"
    }
  });

  return { id: post.id };
}

export async function getPublicBusinessAreaForSubject(input: {
  subjectId: string;
  reviewIds: string[];
}) {
  const db = getBusinessDb();
  const [profileRows, improvementRows, responseRows] = await Promise.all([
    db
      .select({
        id: businessProfiles.id,
        officialDisplayName: businessProfiles.officialDisplayName,
        officialBadgeEnabled: businessProfiles.officialBadgeEnabled,
        updatedAt: businessProfiles.updatedAt
      })
      .from(businessProfiles)
      .where(eq(businessProfiles.subjectId, input.subjectId))
      .limit(1),
    db
      .select({
        id: businessImprovementPosts.id,
        title: businessImprovementPosts.title,
        body: businessImprovementPosts.body,
        category: businessImprovementPosts.category,
        updatedAt: businessImprovementPosts.updatedAt
      })
      .from(businessImprovementPosts)
      .innerJoin(
        businessProfiles,
        eq(businessProfiles.id, businessImprovementPosts.businessProfileId)
      )
      .where(
        and(
          eq(businessImprovementPosts.subjectId, input.subjectId),
          eq(businessImprovementPosts.status, "published"),
          eq(businessProfiles.officialBadgeEnabled, true)
        )
      )
      .orderBy(desc(businessImprovementPosts.updatedAt))
      .limit(6),
    input.reviewIds.length > 0
      ? db
          .select({
            id: businessResponses.id,
            reviewId: businessResponses.reviewId,
            body: businessResponses.body,
            responseType: businessResponses.responseType,
            updatedAt: businessResponses.updatedAt,
            officialDisplayName: businessProfiles.officialDisplayName
          })
          .from(businessResponses)
          .innerJoin(
            businessProfiles,
            eq(businessProfiles.id, businessResponses.businessProfileId)
          )
          .where(
            and(
              inArray(businessResponses.reviewId, input.reviewIds),
              eq(businessResponses.status, "published"),
              eq(businessProfiles.subjectId, input.subjectId),
              eq(businessProfiles.officialBadgeEnabled, true)
            )
          )
          .orderBy(asc(businessResponses.createdAt))
      : Promise.resolve([])
  ]);

  const profile = profileRows[0] ?? null;
  const responsesByReviewId = new Map<
    string,
    Array<{
      id: string;
      body: string;
      responseType: BusinessResponseType;
      responseTypeLabel: string;
      updatedAt: Date;
      officialDisplayName: string | null;
    }>
  >();

  for (const response of responseRows) {
    responsesByReviewId.set(response.reviewId, [
      ...(responsesByReviewId.get(response.reviewId) ?? []),
      {
        ...response,
        responseTypeLabel: BUSINESS_RESPONSE_TYPE_LABELS[response.responseType]
      }
    ]);
  }

  return {
    profile,
    improvementPosts: improvementRows.map((post) => ({
      ...post,
      category: post.category as BusinessImprovementCategory,
      categoryLabel:
        BUSINESS_IMPROVEMENT_CATEGORY_LABELS[
          post.category as BusinessImprovementCategory
        ] ?? BUSINESS_IMPROVEMENT_CATEGORY_LABELS.other
    })),
    responsesByReviewId
  };
}

export const subscriptionSkeletonPlans = [
  {
    plan: "free_claim",
    features: ["공식 계정 신청", "제한적 프로필 표시"]
  },
  {
    plan: "official_basic",
    features: ["공식 배지", "공식 답변", "개선 포스트"]
  },
  {
    plan: "official_pro",
    features: ["불만 태그 통계", "반복 불만 요약", "알림 skeleton"]
  },
  {
    plan: "multi_location",
    features: ["여러 지점 관리", "지점별 공식 계정"]
  },
  {
    plan: "data_api",
    features: ["데이터 리포트", "API 상품 skeleton"]
  }
].map((item) => ({
  ...item,
  planLabel: BUSINESS_PLAN_LABELS[item.plan as BusinessSubscriptionPlan],
  price: BUSINESS_PLAN_PRICES[item.plan as BusinessSubscriptionPlan]
}));
