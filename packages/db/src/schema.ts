import { sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

export const userRoleEnum = pgEnum("user_role", ["user", "business", "admin"]);

export const subjectCategoryEnum = pgEnum("subject_category", [
  "medical_clinic",
  "real_estate",
  "auto_repair"
]);

export const subjectStatusEnum = pgEnum("subject_status", [
  "pending",
  "active",
  "merged",
  "hidden"
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "draft",
  "pending",
  "published",
  "disputed",
  "hidden",
  "removed"
]);

export const evidenceTypeEnum = pgEnum("evidence_type", [
  "receipt",
  "invoice",
  "estimate",
  "contract",
  "photo",
  "video",
  "message",
  "other"
]);

export const businessClaimStatusEnum = pgEnum("business_claim_status", [
  "pending",
  "approved",
  "rejected",
  "revoked"
]);

export const moderationCaseStatusEnum = pgEnum("moderation_case_status", [
  "open",
  "under_review",
  "resolved",
  "rejected"
]);

export const legalRequestStatusEnum = pgEnum("legal_request_status", [
  "received",
  "reviewing",
  "action_taken",
  "rejected",
  "closed"
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free_claim",
  "official_basic",
  "official_pro",
  "multi_location",
  "data_api"
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "none",
  "active",
  "past_due",
  "canceled",
  "paused"
]);

export const businessResponseTypeEnum = pgEnum("business_response_type", [
  "explanation",
  "apology",
  "correction",
  "dispute",
  "resolved"
]);

export const reviewVoteTypeEnum = pgEnum("review_vote_type", [
  "helpful",
  "not_helpful"
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull().default(""),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: userRoleEnum("role").notNull().default("user"),
    ...timestamps
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role)
  ]
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    accountId: text("account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true
    }),
    scope: text("scope"),
    password: text("password_hash"),
    ...timestamps
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId
    )
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_hash"),
    userAgent: text("user_agent_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    uniqueIndex("sessions_token_unique").on(table.token)
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    uniqueIndex("verification_tokens_value_unique").on(table.value),
    uniqueIndex("verification_tokens_identifier_value_unique").on(
      table.identifier,
      table.value
    )
  ]
);

export const betterAuthCoreTables = {
  user: users,
  account: accounts,
  session: sessions,
  verification: verificationTokens
} as const;

export const subjectCategories = pgTable("subject_categories", {
  id: subjectCategoryEnum("id").primaryKey(),
  labelKo: text("label_ko").notNull(),
  labelEn: text("label_en").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: subjectCategoryEnum("category")
      .notNull()
      .references(() => subjectCategories.id),
    subcategory: text("subcategory"),
    description: text("description"),
    websiteUrl: text("website_url"),
    phone: text("phone"),
    status: subjectStatusEnum("status").notNull().default("pending"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    mergedIntoSubjectId: uuid("merged_into_subject_id").references(
      (): AnyPgColumn => subjects.id,
      { onDelete: "set null" }
    ),
    ...timestamps
  },
  (table) => [
    uniqueIndex("subjects_slug_unique").on(table.slug),
    index("subjects_category_status_idx").on(table.category, table.status),
    index("subjects_created_by_user_id_idx").on(table.createdByUserId),
    index("subjects_merged_into_subject_id_idx").on(table.mergedIntoSubjectId)
  ]
);

export const subjectLocations = pgTable(
  "subject_locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    country: text("country").notNull().default("KR"),
    region: text("region"),
    city: text("city"),
    district: text("district"),
    addressLine: text("address_line"),
    postalCode: text("postal_code"),
    lat: numeric("lat", { precision: 10, scale: 7 }),
    lng: numeric("lng", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("subject_locations_subject_id_idx").on(table.subjectId),
    index("subject_locations_region_city_district_idx").on(
      table.region,
      table.city,
      table.district
    )
  ]
);

export const subjectAliases = pgTable(
  "subject_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
    source: text("source").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("subject_aliases_subject_id_idx").on(table.subjectId),
    uniqueIndex("subject_aliases_subject_normalized_unique").on(
      table.subjectId,
      table.normalizedAlias
    )
  ]
);

export const riskTags = pgTable(
  "risk_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    category: subjectCategoryEnum("category")
      .notNull()
      .references(() => subjectCategories.id),
    code: text("code").notNull(),
    labelKo: text("label_ko").notNull(),
    labelEn: text("label_en"),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("risk_tags_category_code_unique").on(table.category, table.code),
    index("risk_tags_category_active_idx").on(table.category, table.isActive)
  ]
);

export const subjectCategoryRiskTags = pgTable(
  "subject_category_risk_tags",
  {
    category: subjectCategoryEnum("category")
      .notNull()
      .references(() => subjectCategories.id, { onDelete: "cascade" }),
    riskTagId: uuid("risk_tag_id")
      .notNull()
      .references(() => riskTags.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true)
  },
  (table) => [
    primaryKey({
      name: "subject_category_risk_tags_pk",
      columns: [table.category, table.riskTagId]
    }),
    index("subject_category_risk_tags_risk_tag_id_idx").on(table.riskTagId)
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    issueSummary: text("issue_summary"),
    status: reviewStatusEnum("status").notNull().default("pending"),
    severityScore: integer("severity_score").notNull().default(0),
    evidenceLevel: integer("evidence_level").notNull().default(0),
    positiveContentDetected: boolean("positive_content_detected")
      .notNull()
      .default(false),
    authorLiabilityConfirmed: boolean("author_liability_confirmed")
      .notNull()
      .default(false),
    isMedicalCategory: boolean("is_medical_category").notNull().default(false),
    ipHash: text("ip_hash"),
    userAgentHash: text("user_agent_hash"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    index("reviews_subject_status_created_at_idx").on(
      table.subjectId,
      table.status,
      table.createdAt
    ),
    index("reviews_user_id_idx").on(table.userId),
    check(
      "reviews_severity_score_range",
      sql`${table.severityScore} >= 0 and ${table.severityScore} <= 100`
    ),
    check(
      "reviews_evidence_level_range",
      sql`${table.evidenceLevel} >= 0 and ${table.evidenceLevel} <= 5`
    )
  ]
);

export const reviewTagLinks = pgTable(
  "review_tag_links",
  {
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    riskTagId: uuid("risk_tag_id")
      .notNull()
      .references(() => riskTags.id, { onDelete: "restrict" })
  },
  (table) => [
    primaryKey({
      name: "review_tag_links_pk",
      columns: [table.reviewId, table.riskTagId]
    }),
    index("review_tag_links_risk_tag_id_idx").on(table.riskTagId)
  ]
);

export const reviewEvidence = pgTable(
  "review_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id").references(() => reviews.id, {
      onDelete: "set null"
    }),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    evidenceType: evidenceTypeEnum("evidence_type").notNull(),
    r2ObjectKey: text("r2_object_key").notNull(),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    fileSha256: text("file_sha256"),
    isPrivate: boolean("is_private").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("review_evidence_review_id_idx").on(table.reviewId),
    index("review_evidence_uploaded_by_user_id_idx").on(table.uploadedByUserId),
    uniqueIndex("review_evidence_r2_object_key_unique").on(table.r2ObjectKey),
    check(
      "review_evidence_file_size_positive",
      sql`${table.fileSizeBytes} > 0`
    )
  ]
);

export const reviewVotes = pgTable(
  "review_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    voteType: reviewVoteTypeEnum("vote_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("review_votes_review_id_idx").on(table.reviewId),
    uniqueIndex("review_votes_review_user_unique").on(table.reviewId, table.userId)
  ]
);

export const reviewReports = pgTable(
  "review_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    reporterUserId: uuid("reporter_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    reason: text("reason").notNull(),
    body: text("body"),
    status: moderationCaseStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("review_reports_review_id_idx").on(table.reviewId),
    index("review_reports_reporter_user_id_idx").on(table.reporterUserId),
    index("review_reports_status_idx").on(table.status)
  ]
);

export const businessProfiles = pgTable(
  "business_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    officialDisplayName: text("official_display_name"),
    officialBadgeEnabled: boolean("official_badge_enabled")
      .notNull()
      .default(false),
    ...timestamps
  },
  (table) => [
    uniqueIndex("business_profiles_subject_id_unique").on(table.subjectId),
    index("business_profiles_owner_user_id_idx").on(table.ownerUserId)
  ]
);

export const businessClaims = pgTable(
  "business_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    applicantName: text("applicant_name").notNull().default(""),
    registrationNumber: text("registration_number"),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    verificationNote: text("verification_note"),
    status: businessClaimStatusEnum("status").notNull().default("pending"),
    adminNote: text("admin_note"),
    ...timestamps
  },
  (table) => [
    index("business_claims_subject_id_idx").on(table.subjectId),
    index("business_claims_user_id_idx").on(table.userId),
    index("business_claims_status_idx").on(table.status)
  ]
);

export const businessResponses = pgTable(
  "business_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    businessProfileId: uuid("business_profile_id")
      .notNull()
      .references(() => businessProfiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    responseType: businessResponseTypeEnum("response_type")
      .notNull()
      .default("explanation"),
    status: text("status").notNull().default("published"),
    ...timestamps
  },
  (table) => [
    index("business_responses_review_id_idx").on(table.reviewId),
    index("business_responses_business_profile_id_idx").on(
      table.businessProfileId
    )
  ]
);

export const businessImprovementPosts = pgTable(
  "business_improvement_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    businessProfileId: uuid("business_profile_id")
      .notNull()
      .references(() => businessProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: text("category").notNull().default("other"),
    status: text("status").notNull().default("published"),
    ...timestamps
  },
  (table) => [
    index("business_improvement_posts_subject_id_idx").on(table.subjectId),
    index("business_improvement_posts_business_profile_id_idx").on(
      table.businessProfileId
    )
  ]
);

export const businessSubscriptions = pgTable(
  "business_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessProfileId: uuid("business_profile_id")
      .notNull()
      .references(() => businessProfiles.id, { onDelete: "cascade" }),
    plan: subscriptionPlanEnum("plan").notNull().default("free_claim"),
    status: subscriptionStatusEnum("status").notNull().default("none"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    uniqueIndex("business_subscriptions_business_profile_id_unique").on(
      table.businessProfileId
    ),
    index("business_subscriptions_plan_status_idx").on(table.plan, table.status)
  ]
);

export const moderationCases = pgTable(
  "moderation_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id").references(() => reviews.id, {
      onDelete: "cascade"
    }),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "cascade"
    }),
    openedByUserId: uuid("opened_by_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    assignedAdminUserId: uuid("assigned_admin_user_id").references(
      () => users.id,
      { onDelete: "set null" }
    ),
    reason: text("reason").notNull(),
    status: moderationCaseStatusEnum("status").notNull().default("open"),
    decision: text("decision"),
    ...timestamps
  },
  (table) => [
    index("moderation_cases_review_id_idx").on(table.reviewId),
    index("moderation_cases_subject_id_idx").on(table.subjectId),
    index("moderation_cases_status_idx").on(table.status),
    index("moderation_cases_assigned_admin_user_id_idx").on(
      table.assignedAdminUserId
    )
  ]
);

export const legalRequests = pgTable(
  "legal_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null"
    }),
    reviewId: uuid("review_id").references(() => reviews.id, {
      onDelete: "set null"
    }),
    requesterName: text("requester_name").notNull(),
    requesterEmail: text("requester_email").notNull(),
    requesterRole: text("requester_role").notNull(),
    requestType: text("request_type").notNull(),
    body: text("body").notNull(),
    status: legalRequestStatusEnum("status").notNull().default("received"),
    adminNote: text("admin_note"),
    ...timestamps
  },
  (table) => [
    index("legal_requests_subject_id_idx").on(table.subjectId),
    index("legal_requests_review_id_idx").on(table.reviewId),
    index("legal_requests_status_idx").on(table.status)
  ]
);

export const takedownRequests = pgTable(
  "takedown_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    legalRequestId: uuid("legal_request_id").references(() => legalRequests.id, {
      onDelete: "set null"
    }),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null"
    }),
    reviewId: uuid("review_id").references(() => reviews.id, {
      onDelete: "set null"
    }),
    requesterEmail: text("requester_email").notNull(),
    reason: text("reason").notNull(),
    status: legalRequestStatusEnum("status").notNull().default("received"),
    ...timestamps
  },
  (table) => [
    index("takedown_requests_legal_request_id_idx").on(table.legalRequestId),
    index("takedown_requests_subject_id_idx").on(table.subjectId),
    index("takedown_requests_review_id_idx").on(table.reviewId),
    index("takedown_requests_status_idx").on(table.status)
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    actorRole: userRoleEnum("actor_role").notNull().default("user"),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("audit_logs_actor_user_id_idx").on(table.actorUserId),
    index("audit_logs_target_idx").on(table.targetType, table.targetId),
    index("audit_logs_action_created_at_idx").on(table.action, table.createdAt)
  ]
);

export const riskScores = pgTable(
  "risk_scores",
  {
    subjectId: uuid("subject_id")
      .primaryKey()
      .references(() => subjects.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    publishedReviewCount: integer("published_review_count").notNull().default(0),
    evidenceWeightSum: integer("evidence_weight_sum").notNull().default(0),
    repeatedTagCount: integer("repeated_tag_count").notNull().default(0),
    recentReviewCount: integer("recent_review_count").notNull().default(0),
    resolvedCount: integer("resolved_count").notNull().default(0),
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    check("risk_scores_score_range", sql`${table.score} >= 0 and ${table.score} <= 100`)
  ]
);

export const subjectDailyStats = pgTable(
  "subject_daily_stats",
  {
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    statDate: date("stat_date").notNull(),
    publishedReviewCount: integer("published_review_count").notNull().default(0),
    searchCount: integer("search_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    evidenceCount: integer("evidence_count").notNull().default(0),
    topRiskTags: jsonb("top_risk_tags")
      .$type<Array<{ code: string; count: number }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    primaryKey({
      name: "subject_daily_stats_pk",
      columns: [table.subjectId, table.statDate]
    })
  ]
);

export const searchEvents = pgTable(
  "search_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    anonymousId: text("anonymous_id"),
    query: text("query").notNull(),
    category: subjectCategoryEnum("category"),
    resultCount: integer("result_count").notNull().default(0),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("search_events_user_id_idx").on(table.userId),
    index("search_events_category_created_at_idx").on(
      table.category,
      table.createdAt
    )
  ]
);

export const shareEvents = pgTable(
  "share_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    anonymousId: text("anonymous_id"),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null"
    }),
    reviewId: uuid("review_id").references(() => reviews.id, {
      onDelete: "set null"
    }),
    channel: text("channel"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("share_events_subject_id_idx").on(table.subjectId),
    index("share_events_review_id_idx").on(table.reviewId),
    index("share_events_created_at_idx").on(table.createdAt)
  ]
);
