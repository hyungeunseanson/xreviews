"use server";

import { redirect } from "next/navigation";
import {
  containsForbiddenReviewField,
  createReviewInputSchema,
  type ReviewActionError
} from "@xreviews/validators";
import { createReview, ReviewWriteError } from "@/server/reviews";
import { requireUser, USER_ROLES, type UserRole } from "@/server/session";

function normalizeRole(value: unknown): UserRole {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : "user";
}

function getNewReviewPath(slug: string, error: ReviewActionError) {
  return `/subjects/${encodeURIComponent(slug)}/reviews/new?error=${error}`;
}

function getSubmittedPath(slug: string) {
  return `/subjects/${encodeURIComponent(slug)}?review=pending`;
}

export async function createReviewAction(
  subjectSlug: string,
  subjectId: string,
  formData: FormData
) {
  const session = await requireUser();

  if (containsForbiddenReviewField(formData.keys())) {
    redirect(getNewReviewPath(subjectSlug, "invalid"));
  }

  const riskTagIds = formData
    .getAll("riskTagIds")
    .filter((value): value is string => typeof value === "string");
  const evidenceIds = formData
    .getAll("evidenceIds")
    .filter((value): value is string => typeof value === "string");

  if (riskTagIds.length === 0) {
    redirect(getNewReviewPath(subjectSlug, "tags"));
  }

  if (formData.get("authorLiabilityConfirmed") !== "on") {
    redirect(getNewReviewPath(subjectSlug, "liability"));
  }

  const parsed = createReviewInputSchema.safeParse({
    subjectId,
    title: formData.get("title"),
    issueSummary: formData.get("issueSummary"),
    body: formData.get("body"),
    riskTagIds,
    evidenceIds,
    severityScore: formData.get("severityScore"),
    authorLiabilityConfirmed: formData.get("authorLiabilityConfirmed")
  });

  if (!parsed.success) {
    redirect(getNewReviewPath(subjectSlug, "invalid"));
  }

  try {
    await createReview(parsed.data, {
      userId: session.user.id,
      role: normalizeRole(session.user.role)
    });
  } catch (error) {
    if (error instanceof ReviewWriteError) {
      redirect(getNewReviewPath(subjectSlug, error.code));
    }

    console.error("[Xreviews reviews] Failed to create review", error);
    redirect(getNewReviewPath(subjectSlug, "create"));
  }

  redirect(getSubmittedPath(subjectSlug));
}
