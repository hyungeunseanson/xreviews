import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import {
  auditLogs,
  businessImprovementPosts,
  businessProfiles,
  businessResponses,
  reviews,
  reviewTagLinks,
  riskScores,
  riskTags,
  subjectDailyStats,
  subjectLocations,
  subjects
} from "@xreviews/db/schema";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  type MvpCategory
} from "@xreviews/shared/constants";
import { buildAnalyticsMetadata } from "../lib/analytics/events";
import { tryGetServerDb } from "./db";

type RiskDb = NonNullable<ReturnType<typeof tryGetServerDb>>;

export type RiskTagSignal = {
  id: string;
  code: string;
  labelKo: string;
  count: number;
};

export type XRiskBreakdown = {
  publishedComplaintCount: number;
  evidenceBackedCount: number;
  evidenceWeightSum: number;
  repeatedTagCount: number;
  recentReviewCount: number;
  businessResponseCount: number;
  improvementPostCount: number;
  mitigationCount: number;
  medicalCautionApplied: boolean;
};

export type XRiskSubject = {
  id: string;
  slug: string;
  name: string;
  category: MvpCategory;
  categoryLabel: string;
  categoryDescription: string;
  locationSummary: string;
  score: number;
  topRiskTags: RiskTagSignal[];
  breakdown: XRiskBreakdown;
  officialBadgeEnabled: boolean;
  hasImprovementPost: boolean;
  calculatedAt: Date;
};

type PublishedReviewSignal = {
  id: string;
  subjectId: string;
  severityScore: number;
  evidenceLevel: number;
  positiveContentDetected: boolean;
  isMedicalCategory: boolean;
  createdAt: Date;
  publishedAt: Date | null;
};

type SubjectSignalRow = {
  id: string;
  slug: string;
  name: string;
  category: MvpCategory;
  city: string | null;
  district: string | null;
  addressLine: string | null;
  officialBadgeEnabled: boolean | null;
};

type SubjectRiskInput = {
  subject: SubjectSignalRow;
  reviews: PublishedReviewSignal[];
  tagSignals: RiskTagSignal[];
  businessResponseCount: number;
  improvementPostCount: number;
};

const scoreBounds = {
  min: 0,
  max: 100
} as const;

function clampScore(value: number) {
  return Math.max(scoreBounds.min, Math.min(scoreBounds.max, Math.round(value)));
}

function formatLocationSummary(input: {
  city?: string | null;
  district?: string | null;
  addressLine?: string | null;
}) {
  const addressLine = input.addressLine?.trim();

  if (addressLine) {
    return addressLine;
  }

  return [input.city, input.district]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ") || "위치 정보 없음";
}

function evidenceWeight(level: number) {
  if (level <= 0) {
    return 0;
  }

  if (level === 1) {
    return 3;
  }

  if (level === 2) {
    return 6;
  }

  if (level === 3) {
    return 9;
  }

  if (level === 4) {
    return 12;
  }

  return 15;
}

function normalizedSeverityWeight(score: number) {
  const safeScore = Math.max(0, score);

  if (safeScore <= 5) {
    return safeScore * 3;
  }

  return Math.min(18, safeScore * 0.35);
}

function isRecent(review: PublishedReviewSignal, now: Date) {
  const referenceDate = review.publishedAt ?? review.createdAt;
  const ageMs = now.getTime() - referenceDate.getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  return ageMs >= 0 && ageMs <= thirtyDaysMs;
}

export function calculateXRiskScore(input: SubjectRiskInput, now = new Date()) {
  const publishedComplaintCount = input.reviews.length;
  const evidenceBackedCount = input.reviews.filter(
    (review) => review.evidenceLevel > 0
  ).length;
  const evidenceWeightSum = input.reviews.reduce(
    (sum, review) => sum + evidenceWeight(review.evidenceLevel),
    0
  );
  const repeatedTagCount = input.tagSignals.filter((tag) => tag.count > 1).length;
  const repeatedTagWeight = input.tagSignals.reduce((sum, tag) => {
    if (tag.count <= 1) {
      return sum;
    }

    return sum + Math.min(12, (tag.count - 1) * 5);
  }, 0);
  const recentReviewCount = input.reviews.filter((review) =>
    isRecent(review, now)
  ).length;
  const severityWeight = input.reviews.reduce(
    (sum, review) => sum + normalizedSeverityWeight(review.severityScore),
    0
  );
  const positiveSignalPenalty = Math.min(
    9,
    input.reviews.filter((review) => review.positiveContentDetected).length * 3
  );
  const mitigationCount =
    input.businessResponseCount + input.improvementPostCount;
  const mitigationWeight = Math.min(
    16,
    input.businessResponseCount * 2 + input.improvementPostCount * 4
  );

  const rawScore =
    publishedComplaintCount * 8 +
    Math.min(24, severityWeight) +
    Math.min(24, evidenceWeightSum) +
    Math.min(18, repeatedTagWeight) +
    Math.min(16, recentReviewCount * 4) -
    mitigationWeight -
    positiveSignalPenalty;
  const medicalCautionApplied = input.subject.category === "medical_clinic";
  const score = clampScore(medicalCautionApplied ? rawScore * 0.92 : rawScore);

  return {
    score,
    topRiskTags: input.tagSignals
      .filter((tag) => tag.count > 0)
      .sort((a, b) => b.count - a.count || a.labelKo.localeCompare(b.labelKo))
      .slice(0, 5),
    breakdown: {
      publishedComplaintCount,
      evidenceBackedCount,
      evidenceWeightSum,
      repeatedTagCount,
      recentReviewCount,
      businessResponseCount: input.businessResponseCount,
      improvementPostCount: input.improvementPostCount,
      mitigationCount,
      medicalCautionApplied
    } satisfies XRiskBreakdown
  };
}

function getRiskDb() {
  const db = tryGetServerDb();

  if (!db) {
    return null;
  }

  return db;
}

async function loadSubjectRiskInputs(input: {
  category?: MvpCategory;
  subjectId?: string;
}) {
  const db = getRiskDb();

  if (!db) {
    return [];
  }

  const filters = [eq(subjects.status, "active")];

  if (input.category) {
    filters.push(eq(subjects.category, input.category));
  }

  if (input.subjectId) {
    filters.push(eq(subjects.id, input.subjectId));
  }

  const subjectRows = await db
    .select({
      id: subjects.id,
      slug: subjects.slug,
      name: subjects.name,
      category: subjects.category,
      city: subjectLocations.city,
      district: subjectLocations.district,
      addressLine: subjectLocations.addressLine,
      officialBadgeEnabled: businessProfiles.officialBadgeEnabled
    })
    .from(subjects)
    .leftJoin(subjectLocations, eq(subjectLocations.subjectId, subjects.id))
    .leftJoin(businessProfiles, eq(businessProfiles.subjectId, subjects.id))
    .where(and(...filters))
    .orderBy(asc(subjects.name));

  if (subjectRows.length === 0) {
    return [];
  }

  const subjectIds = subjectRows.map((subject) => subject.id);
  const reviewRows = await db
    .select({
      id: reviews.id,
      subjectId: reviews.subjectId,
      severityScore: reviews.severityScore,
      evidenceLevel: reviews.evidenceLevel,
      positiveContentDetected: reviews.positiveContentDetected,
      isMedicalCategory: reviews.isMedicalCategory,
      createdAt: reviews.createdAt,
      publishedAt: reviews.publishedAt
    })
    .from(reviews)
    .where(
      and(inArray(reviews.subjectId, subjectIds), eq(reviews.status, "published"))
    );
  const reviewIds = reviewRows.map((review) => review.id);
  const reviewSubjectId = new Map(
    reviewRows.map((review) => [review.id, review.subjectId])
  );
  const [tagRows, responseRows, improvementRows] =
    reviewIds.length > 0
      ? await Promise.all([
          db
            .select({
              reviewId: reviewTagLinks.reviewId,
              id: riskTags.id,
              code: riskTags.code,
              labelKo: riskTags.labelKo
            })
            .from(reviewTagLinks)
            .innerJoin(riskTags, eq(riskTags.id, reviewTagLinks.riskTagId))
            .where(inArray(reviewTagLinks.reviewId, reviewIds)),
          db
            .select({
              reviewId: businessResponses.reviewId
            })
            .from(businessResponses)
            .where(
              and(
                inArray(businessResponses.reviewId, reviewIds),
                eq(businessResponses.status, "published")
              )
            ),
          db
            .select({
              subjectId: businessImprovementPosts.subjectId
            })
            .from(businessImprovementPosts)
            .where(
              and(
                inArray(businessImprovementPosts.subjectId, subjectIds),
                eq(businessImprovementPosts.status, "published")
              )
            )
        ])
      : await Promise.all([
          Promise.resolve([]),
          Promise.resolve([]),
          db
            .select({
              subjectId: businessImprovementPosts.subjectId
            })
            .from(businessImprovementPosts)
            .where(
              and(
                inArray(businessImprovementPosts.subjectId, subjectIds),
                eq(businessImprovementPosts.status, "published")
              )
            )
        ]);

  const reviewsBySubject = new Map<string, PublishedReviewSignal[]>();
  const tagCountsBySubject = new Map<
    string,
    Map<string, Omit<RiskTagSignal, "count"> & { count: number }>
  >();
  const responseCountBySubject = new Map<string, number>();
  const improvementCountBySubject = new Map<string, number>();

  for (const review of reviewRows) {
    reviewsBySubject.set(review.subjectId, [
      ...(reviewsBySubject.get(review.subjectId) ?? []),
      review
    ]);
  }

  for (const tag of tagRows) {
    const subjectId = reviewSubjectId.get(tag.reviewId);

    if (!subjectId) {
      continue;
    }

    const subjectTagCounts = tagCountsBySubject.get(subjectId) ?? new Map();
    const current = subjectTagCounts.get(tag.id) ?? {
      id: tag.id,
      code: tag.code,
      labelKo: tag.labelKo,
      count: 0
    };

    subjectTagCounts.set(tag.id, {
      ...current,
      count: current.count + 1
    });
    tagCountsBySubject.set(subjectId, subjectTagCounts);
  }

  for (const response of responseRows) {
    const subjectId = reviewSubjectId.get(response.reviewId);

    if (!subjectId) {
      continue;
    }

    responseCountBySubject.set(
      subjectId,
      (responseCountBySubject.get(subjectId) ?? 0) + 1
    );
  }

  for (const post of improvementRows) {
    improvementCountBySubject.set(
      post.subjectId,
      (improvementCountBySubject.get(post.subjectId) ?? 0) + 1
    );
  }

  return subjectRows.map((subject) => ({
    subject,
    reviews: reviewsBySubject.get(subject.id) ?? [],
    tagSignals: Array.from(tagCountsBySubject.get(subject.id)?.values() ?? []),
    businessResponseCount: responseCountBySubject.get(subject.id) ?? 0,
    improvementPostCount: improvementCountBySubject.get(subject.id) ?? 0
  })) satisfies SubjectRiskInput[];
}

function toXRiskSubject(input: SubjectRiskInput, now = new Date()): XRiskSubject {
  const result = calculateXRiskScore(input, now);

  return {
    id: input.subject.id,
    slug: input.subject.slug,
    name: input.subject.name,
    category: input.subject.category,
    categoryLabel: CATEGORY_LABELS[input.subject.category],
    categoryDescription: CATEGORY_DESCRIPTIONS[input.subject.category],
    locationSummary: formatLocationSummary(input.subject),
    score: result.score,
    topRiskTags: result.topRiskTags,
    breakdown: result.breakdown,
    officialBadgeEnabled: Boolean(input.subject.officialBadgeEnabled),
    hasImprovementPost: input.improvementPostCount > 0,
    calculatedAt: now
  };
}

function sortRiskSubjects(left: XRiskSubject, right: XRiskSubject) {
  return (
    right.score - left.score ||
    right.breakdown.recentReviewCount - left.breakdown.recentReviewCount ||
    right.breakdown.evidenceBackedCount - left.breakdown.evidenceBackedCount ||
    right.breakdown.publishedComplaintCount -
      left.breakdown.publishedComplaintCount ||
    left.name.localeCompare(right.name)
  );
}

export async function getTopRiskSubjects(input: {
  category?: MvpCategory;
  limit?: number;
} = {}) {
  const now = new Date();
  const rows = await loadSubjectRiskInputs({ category: input.category });

  return rows
    .map((row) => toXRiskSubject(row, now))
    .filter((item) => item.breakdown.publishedComplaintCount > 0)
    .sort(sortRiskSubjects)
    .slice(0, input.limit ?? 20);
}

export async function getCategoryRankings(category: MvpCategory, limit = 50) {
  return getTopRiskSubjects({ category, limit });
}

export async function getSubjectRiskOverview(subjectId: string) {
  const rows = await loadSubjectRiskInputs({ subjectId });
  const row = rows[0];

  if (!row) {
    return null;
  }

  return toXRiskSubject(row);
}

export async function getTrendingRiskTags(input: {
  category?: MvpCategory;
  limit?: number;
} = {}) {
  const subjectsWithSignals = await getTopRiskSubjects({
    category: input.category,
    limit: 100
  });
  const tagCounts = new Map<string, RiskTagSignal>();

  for (const subject of subjectsWithSignals) {
    for (const tag of subject.topRiskTags) {
      const current = tagCounts.get(tag.id) ?? {
        ...tag,
        count: 0
      };

      tagCounts.set(tag.id, {
        ...current,
        count: current.count + tag.count
      });
    }
  }

  return Array.from(tagCounts.values())
    .sort((a, b) => b.count - a.count || a.labelKo.localeCompare(b.labelKo))
    .slice(0, input.limit ?? 8);
}

export async function recordRankingViewed(input: {
  category?: MvpCategory | "all";
  subjectCount?: number;
}) {
  const db = getRiskDb();

  if (!db) {
    return;
  }

  await db.insert(auditLogs).values({
    actorUserId: null,
    actorRole: "user",
    action: "ranking_viewed",
    targetType: "ranking",
    targetId: null,
    metadata: buildAnalyticsMetadata("ranking_viewed", {
      category: input.category ?? "all",
      subjectCount: input.subjectCount
    })
  });
}

export async function recordRankingSubjectClicked(input: {
  subjectId: string;
  category?: MvpCategory | "all";
}) {
  const db = getRiskDb();

  if (!db) {
    return;
  }

  await db.insert(auditLogs).values({
    actorUserId: null,
    actorRole: "user",
    action: "ranking_subject_clicked",
    targetType: "subject",
    targetId: input.subjectId,
    metadata: buildAnalyticsMetadata("ranking_subject_clicked", {
      subjectId: input.subjectId,
      category: input.category ?? "all"
    })
  });
}

async function upsertRiskScore(
  db: RiskDb,
  subject: XRiskSubject,
  calculatedAt: Date
) {
  await db
    .insert(riskScores)
    .values({
      subjectId: subject.id,
      score: subject.score,
      publishedReviewCount: subject.breakdown.publishedComplaintCount,
      evidenceWeightSum: subject.breakdown.evidenceWeightSum,
      repeatedTagCount: subject.breakdown.repeatedTagCount,
      recentReviewCount: subject.breakdown.recentReviewCount,
      resolvedCount: subject.breakdown.mitigationCount,
      calculatedAt
    })
    .onConflictDoUpdate({
      target: riskScores.subjectId,
      set: {
        score: subject.score,
        publishedReviewCount: subject.breakdown.publishedComplaintCount,
        evidenceWeightSum: subject.breakdown.evidenceWeightSum,
        repeatedTagCount: subject.breakdown.repeatedTagCount,
        recentReviewCount: subject.breakdown.recentReviewCount,
        resolvedCount: subject.breakdown.mitigationCount,
        calculatedAt
      }
    });
}

async function upsertSubjectDailyStats(
  db: RiskDb,
  subject: XRiskSubject,
  calculatedAt: Date
) {
  const statDate = calculatedAt.toISOString().slice(0, 10);

  await db
    .insert(subjectDailyStats)
    .values({
      subjectId: subject.id,
      statDate,
      publishedReviewCount: subject.breakdown.publishedComplaintCount,
      evidenceCount: subject.breakdown.evidenceBackedCount,
      topRiskTags: subject.topRiskTags.map((tag) => ({
        code: tag.code,
        count: tag.count
      }))
    })
    .onConflictDoUpdate({
      target: [subjectDailyStats.subjectId, subjectDailyStats.statDate],
      set: {
        publishedReviewCount: subject.breakdown.publishedComplaintCount,
        evidenceCount: subject.breakdown.evidenceBackedCount,
        topRiskTags: subject.topRiskTags.map((tag) => ({
          code: tag.code,
          count: tag.count
        }))
      }
    });
}

export async function recalculateRiskScores(input: {
  category?: MvpCategory;
  actorUserId?: string | null;
} = {}) {
  const db = getRiskDb();

  if (!db) {
    throw new Error("DATABASE_URL is required.");
  }

  const calculatedAt = new Date();
  const rows = await loadSubjectRiskInputs({ category: input.category });
  const subjectsWithScores = rows.map((row) => toXRiskSubject(row, calculatedAt));

  for (const subject of subjectsWithScores) {
    await upsertRiskScore(db, subject, calculatedAt);
    await upsertSubjectDailyStats(db, subject, calculatedAt);
    await db.insert(auditLogs).values({
      actorUserId: input.actorUserId ?? null,
      actorRole: "admin",
      action: "risk_score_recalculated",
      targetType: "subject",
      targetId: subject.id,
      metadata: {
        subjectId: subject.id,
        score: subject.score,
        publishedReviewCount: subject.breakdown.publishedComplaintCount,
        evidenceBackedCount: subject.breakdown.evidenceBackedCount,
        repeatedTagCount: subject.breakdown.repeatedTagCount,
        category: subject.category,
        phase: "phase_8_rankings"
      }
    });
  }

  const rankedSubjects = subjectsWithScores
    .filter((subject) => subject.breakdown.publishedComplaintCount > 0)
    .sort(sortRiskSubjects);

  const [lastCalculated] = await db
    .select({
      calculatedAt: riskScores.calculatedAt
    })
    .from(riskScores)
    .where(gte(riskScores.calculatedAt, calculatedAt))
    .orderBy(desc(riskScores.calculatedAt))
    .limit(1);

  return {
    recalculatedCount: subjectsWithScores.length,
    rankedCount: rankedSubjects.length,
    calculatedAt: lastCalculated?.calculatedAt ?? calculatedAt,
    topSubjects: rankedSubjects.slice(0, 5).map((subject) => ({
      id: subject.id,
      name: subject.name,
      category: subject.category,
      score: subject.score,
      publishedComplaintCount: subject.breakdown.publishedComplaintCount
    }))
  };
}
