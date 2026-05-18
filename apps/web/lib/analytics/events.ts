import type { MvpCategory } from "@xreviews/shared/constants";

export const analyticsEventNames = [
  "search_performed",
  "subject_viewed",
  "subject_created",
  "review_started",
  "review_submitted",
  "positive_review_blocked",
  "medical_guardrail_blocked",
  "evidence_upload_started",
  "evidence_uploaded",
  "business_claim_started",
  "business_claim_submitted",
  "business_response_created",
  "business_improvement_post_created",
  "moderation_action_taken",
  "ranking_viewed",
  "ranking_subject_clicked",
  "login_started",
  "login_completed"
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsCategory = MvpCategory | "all";
export type ScoreRange = "0-20" | "21-40" | "41-60" | "61-80" | "81-100";
export type FileSizeRange = "0-1mb" | "1-5mb" | "5-10mb" | "10mb-plus";

type ReviewStatus =
  | "draft"
  | "pending"
  | "published"
  | "disputed"
  | "hidden"
  | "removed";
type BusinessClaimStatus = "pending" | "approved" | "rejected" | "revoked";
type EvidenceType =
  | "receipt"
  | "invoice"
  | "estimate"
  | "contract"
  | "photo"
  | "video"
  | "message"
  | "other";

export type AnalyticsEventPayloads = {
  search_performed: {
    category?: AnalyticsCategory;
    queryPresent?: boolean;
    resultCount?: number;
  };
  subject_viewed: {
    subjectId: string;
    category: MvpCategory;
    status?: string;
  };
  subject_created: {
    subjectId: string;
    category: MvpCategory;
    status?: string;
  };
  review_started: {
    subjectId: string;
    category: MvpCategory;
  };
  review_submitted: {
    subjectId: string;
    reviewId: string;
    category: MvpCategory;
    status: "pending";
    riskTagCount: number;
    evidenceCount: number;
  };
  positive_review_blocked: {
    subjectId?: string;
    category?: MvpCategory;
    riskTagCount?: number;
  };
  medical_guardrail_blocked: {
    subjectId: string;
    category: "medical_clinic";
    riskTagCount: number;
  };
  evidence_upload_started: {
    evidenceType: EvidenceType;
    fileSizeRange: FileSizeRange;
  };
  evidence_uploaded: {
    evidenceType: EvidenceType;
    fileSizeRange: FileSizeRange;
  };
  business_claim_started: {
    subjectId: string;
    category: MvpCategory;
  };
  business_claim_submitted: {
    subjectId: string;
    category?: MvpCategory;
    status: BusinessClaimStatus;
  };
  business_response_created: {
    subjectId: string;
    reviewId: string;
  };
  business_improvement_post_created: {
    subjectId: string;
    category?: string;
  };
  moderation_action_taken: {
    subjectId?: string;
    reviewId: string;
    previousStatus: ReviewStatus;
    nextStatus: ReviewStatus;
    action?: string;
  };
  ranking_viewed: {
    category?: AnalyticsCategory;
    subjectCount?: number;
  };
  ranking_subject_clicked: {
    subjectId: string;
    category: AnalyticsCategory;
    scoreRange?: ScoreRange;
  };
  login_started: Record<string, never>;
  login_completed: Record<string, never>;
};

export type AnalyticsPayload<Name extends AnalyticsEventName> =
  AnalyticsEventPayloads[Name];

type SafeAnalyticsValue = string | number | boolean | null;
type SafeAnalyticsPayload = Record<string, SafeAnalyticsValue>;

const allowedPayloadKeys = new Set([
  "action",
  "category",
  "evidenceCount",
  "evidenceType",
  "fileSizeRange",
  "nextStatus",
  "previousStatus",
  "queryPresent",
  "resultCount",
  "reviewId",
  "riskTagCount",
  "scoreRange",
  "status",
  "subjectCount",
  "subjectId"
]);

const forbiddenPayloadKeyPattern =
  /(body|content|email|fileName|objectKey|phone|publicUrl|r2|raw|secret|signedUrl|token|uploadUrl|url)/i;

function normalizeAnalyticsValue(value: unknown): SafeAnalyticsValue | undefined {
  if (typeof value === "string") {
    return value.slice(0, 160);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean" || value === null) {
    return value;
  }

  return undefined;
}

export function sanitizeAnalyticsPayload(
  payload: Record<string, unknown> = {}
): SafeAnalyticsPayload {
  const safePayload: SafeAnalyticsPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!allowedPayloadKeys.has(key) || forbiddenPayloadKeyPattern.test(key)) {
      continue;
    }

    const normalizedValue = normalizeAnalyticsValue(value);

    if (normalizedValue !== undefined) {
      safePayload[key] = normalizedValue;
    }
  }

  return safePayload;
}

export function buildAnalyticsMetadata<Name extends AnalyticsEventName>(
  eventName: Name,
  payload: AnalyticsPayload<Name>,
  extra: Record<string, unknown> = {}
) {
  return {
    eventName,
    ...sanitizeAnalyticsPayload(payload),
    ...sanitizeAnalyticsPayload(extra),
    phase: "phase_9_observability"
  };
}

export function getScoreRange(score: number): ScoreRange {
  if (score <= 20) {
    return "0-20";
  }

  if (score <= 40) {
    return "21-40";
  }

  if (score <= 60) {
    return "41-60";
  }

  if (score <= 80) {
    return "61-80";
  }

  return "81-100";
}

export function getFileSizeRange(fileSizeBytes: number): FileSizeRange {
  const oneMb = 1024 * 1024;

  if (fileSizeBytes <= oneMb) {
    return "0-1mb";
  }

  if (fileSizeBytes <= oneMb * 5) {
    return "1-5mb";
  }

  if (fileSizeBytes <= oneMb * 10) {
    return "5-10mb";
  }

  return "10mb-plus";
}
