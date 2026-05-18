import { randomUUID } from "crypto";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  ne,
  or,
  sql
} from "drizzle-orm";
import {
  auditLogs,
  businessProfiles,
  riskScores,
  riskTags,
  searchEvents,
  subjectCategoryRiskTags,
  subjectLocations,
  subjects
} from "@xreviews/db/schema";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  type MvpCategory
} from "@xreviews/shared/constants";
import type {
  CreateSubjectInput,
  SubjectSearchInput
} from "@xreviews/validators";
import { createSubjectInputSchema, subjectSearchInputSchema } from "@xreviews/validators";
import { recordAnalyticsEvent } from "@/server/analytics";
import { getServerDb, tryGetServerDb } from "@/server/db";
import type { UserRole } from "@/server/session";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("DATABASE_URL is required for subject mutations.");
  }
}

export type SubjectSummary = {
  id: string;
  name: string;
  slug: string;
  category: MvpCategory;
  categoryLabel: string;
  categoryDescription: string;
  description: string | null;
  locationSummary: string;
  status: "pending" | "active" | "merged" | "hidden";
  riskScore: number | null;
  publishedReviewCount: number;
  officialBadgeEnabled: boolean;
  createdAt: Date;
};

export type SubjectRiskTag = {
  id: string;
  code: string;
  labelKo: string;
  labelEn: string | null;
};

export type SearchSubjectsResult = {
  dbConfigured: boolean;
  items: SubjectSummary[];
};

export type CreateSubjectResult =
  | {
      status: "created";
      subject: SubjectSummary;
    }
  | {
      status: "duplicate";
      subject: SubjectSummary;
    };

function normalizeComparable(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function makeSubjectSlug(name: string, city?: string, district?: string) {
  const base = [name, city, district]
    .filter(Boolean)
    .join(" ")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return base || `subject-${randomUUID().slice(0, 8)}`;
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

  const parts = [input.city, input.district].filter(
    (value): value is string => Boolean(value?.trim())
  );

  return parts.join(" ") || "위치 정보 없음";
}

function toSubjectSummary(row: {
  subject: typeof subjects.$inferSelect;
  location: typeof subjectLocations.$inferSelect | null;
  score: typeof riskScores.$inferSelect | null;
  businessProfile: typeof businessProfiles.$inferSelect | null;
}): SubjectSummary {
  return {
    id: row.subject.id,
    name: row.subject.name,
    slug: row.subject.slug,
    category: row.subject.category,
    categoryLabel: CATEGORY_LABELS[row.subject.category],
    categoryDescription: CATEGORY_DESCRIPTIONS[row.subject.category],
    description: row.subject.description,
    locationSummary: formatLocationSummary({
      city: row.location?.city,
      district: row.location?.district,
      addressLine: row.location?.addressLine
    }),
    status: row.subject.status,
    riskScore: row.score?.score ?? null,
    publishedReviewCount: row.score?.publishedReviewCount ?? 0,
    officialBadgeEnabled: row.businessProfile?.officialBadgeEnabled ?? false,
    createdAt: row.subject.createdAt
  };
}

async function buildUniqueSlug(
  db: ReturnType<typeof getServerDb>,
  input: CreateSubjectInput
) {
  const baseSlug = makeSubjectSlug(input.name, input.city, input.district);

  for (let index = 0; index < 6; index += 1) {
    const candidate = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.slug, candidate))
      .limit(1);

    if (existing.length === 0) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomUUID().slice(0, 8)}`;
}

async function findDuplicateSubject(
  db: ReturnType<typeof getServerDb>,
  input: CreateSubjectInput
) {
  const normalizedName = normalizeComparable(input.name);
  const normalizedAddress = input.address
    ? normalizeComparable(input.address)
    : undefined;
  const baseWhere = and(
    eq(subjects.category, input.category),
    sql`lower(trim(${subjects.name})) = ${normalizedName}`,
    ne(subjects.status, "hidden")
  );

  const addressWhere = normalizedAddress
    ? and(
        baseWhere,
        sql`lower(trim(coalesce(${subjectLocations.addressLine}, ''))) = ${normalizedAddress}`
      )
    : baseWhere;

  const rows = await db
    .select({
      subject: subjects,
      location: subjectLocations,
      score: riskScores,
      businessProfile: businessProfiles
    })
    .from(subjects)
    .leftJoin(subjectLocations, eq(subjectLocations.subjectId, subjects.id))
    .leftJoin(riskScores, eq(riskScores.subjectId, subjects.id))
    .leftJoin(businessProfiles, eq(businessProfiles.subjectId, subjects.id))
    .where(addressWhere)
    .limit(1);

  return rows[0] ? toSubjectSummary(rows[0]) : null;
}

async function recordSearchEvent(
  db: ReturnType<typeof getServerDb>,
  input: SubjectSearchInput,
  resultCount: number
) {
  if (!input.q && !input.category) {
    return;
  }

  await db.insert(searchEvents).values({
    query: input.q ? "[query_present]" : "",
    category: input.category,
    resultCount
  });
}

export async function createSubject(
  rawInput: CreateSubjectInput,
  actor: { userId: string; role: UserRole }
): Promise<CreateSubjectResult> {
  const db = tryGetServerDb();

  if (!db) {
    throw new DatabaseUnavailableError();
  }

  const input = createSubjectInputSchema.parse(rawInput);
  const duplicate = await findDuplicateSubject(db, input);

  if (duplicate) {
    return {
      status: "duplicate",
      subject: duplicate
    };
  }

  const slug = await buildUniqueSlug(db, input);
  const [createdSubject] = await db
    .insert(subjects)
    .values({
      name: input.name,
      slug,
      category: input.category,
      description: input.description,
      websiteUrl: input.website,
      phone: input.phone,
      status: "active",
      createdByUserId: actor.userId
    })
    .returning();

  const hasLocation =
    Boolean(input.address) || Boolean(input.city) || Boolean(input.district);

  let createdLocation: typeof subjectLocations.$inferSelect | null = null;

  if (hasLocation) {
    const [location] = await db
      .insert(subjectLocations)
      .values({
        subjectId: createdSubject.id,
        addressLine: input.address,
        city: input.city,
        district: input.district
      })
      .returning();

    createdLocation = location;
  }

  await db.insert(auditLogs).values({
    actorUserId: actor.userId,
    actorRole: actor.role,
    action: "subject.created",
    targetType: "subject",
    targetId: createdSubject.id,
    metadata: {
      category: input.category,
      phase: "phase_3_subjects"
    }
  });

  await recordAnalyticsEvent(
    "subject_created",
    {
      subjectId: createdSubject.id,
      category: input.category,
      status: createdSubject.status
    },
    {
      actorUserId: actor.userId,
      actorRole: actor.role
    }
  ).catch((error: unknown) => {
    console.error("[Xreviews analytics] Failed to record subject_created", error);
  });

  return {
    status: "created",
    subject: toSubjectSummary({
      subject: createdSubject,
      location: createdLocation,
      score: null,
      businessProfile: null
    })
  };
}

export async function searchSubjects(
  rawInput: Partial<SubjectSearchInput> = {}
): Promise<SearchSubjectsResult> {
  const db = tryGetServerDb();
  const input = subjectSearchInputSchema.parse(rawInput);

  if (!db) {
    return {
      dbConfigured: false,
      items: []
    };
  }

  const filters = [eq(subjects.status, "active")];
  const query = input.q?.trim();

  if (input.category) {
    filters.push(eq(subjects.category, input.category));
  }

  if (query) {
    const pattern = `%${query}%`;
    filters.push(
      or(
        ilike(subjects.name, pattern),
        ilike(subjects.description, pattern),
        ilike(subjectLocations.addressLine, pattern),
        ilike(subjectLocations.city, pattern),
        ilike(subjectLocations.district, pattern)
      )!
    );
  }

  const rows = await db
    .select({
      subject: subjects,
      location: subjectLocations,
      score: riskScores,
      businessProfile: businessProfiles
    })
    .from(subjects)
    .leftJoin(subjectLocations, eq(subjectLocations.subjectId, subjects.id))
    .leftJoin(riskScores, eq(riskScores.subjectId, subjects.id))
    .leftJoin(businessProfiles, eq(businessProfiles.subjectId, subjects.id))
    .where(and(...filters))
    .orderBy(desc(subjects.createdAt))
    .limit(input.limit);

  const items = rows.map(toSubjectSummary);

  await recordSearchEvent(db, input, items.length).catch((error: unknown) => {
    console.error("[Xreviews subjects] Failed to record search event", error);
  });
  await recordAnalyticsEvent("search_performed", {
    category: input.category ?? "all",
    queryPresent: Boolean(query),
    resultCount: items.length
  }).catch((error: unknown) => {
    console.error("[Xreviews analytics] Failed to record search_performed", error);
  });

  return {
    dbConfigured: true,
    items
  };
}

export async function getSubjectBySlugOrId(slugOrId: string) {
  const db = tryGetServerDb();

  if (!db) {
    return null;
  }

  const identifier = decodeURIComponent(slugOrId);
  const identifierWhere = uuidPattern.test(identifier)
    ? or(eq(subjects.slug, identifier), eq(subjects.id, identifier))
    : eq(subjects.slug, identifier);

  const rows = await db
    .select({
      subject: subjects,
      location: subjectLocations,
      score: riskScores,
      businessProfile: businessProfiles
    })
    .from(subjects)
    .leftJoin(subjectLocations, eq(subjectLocations.subjectId, subjects.id))
    .leftJoin(riskScores, eq(riskScores.subjectId, subjects.id))
    .leftJoin(businessProfiles, eq(businessProfiles.subjectId, subjects.id))
    .where(and(identifierWhere, ne(subjects.status, "hidden")))
    .limit(1);

  return rows[0] ? toSubjectSummary(rows[0]) : null;
}

export async function getSubjectRiskTags(category: MvpCategory) {
  const db = tryGetServerDb();

  if (!db) {
    return [];
  }

  return db
    .select({
      id: riskTags.id,
      code: riskTags.code,
      labelKo: riskTags.labelKo,
      labelEn: riskTags.labelEn
    })
    .from(subjectCategoryRiskTags)
    .innerJoin(riskTags, eq(riskTags.id, subjectCategoryRiskTags.riskTagId))
    .where(
      and(
        eq(subjectCategoryRiskTags.category, category),
        eq(subjectCategoryRiskTags.isActive, true),
        eq(riskTags.isActive, true)
      )
    )
    .orderBy(asc(subjectCategoryRiskTags.sortOrder), asc(riskTags.labelKo));
}
