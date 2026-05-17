"use server";

import { redirect } from "next/navigation";
import {
  AdminModerationError,
  updateReviewModerationStatus
} from "@/server/admin/moderation";
import { requireAdmin } from "@/server/session";

type ModerationActionName = "approve" | "dispute" | "hide" | "remove";

function getAdminReviewPath(reviewId: string, result: string) {
  return `/admin/reviews/${encodeURIComponent(reviewId)}?result=${result}`;
}

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

async function runModerationAction(
  action: ModerationActionName,
  reviewId: string,
  formData: FormData
) {
  const session = await requireAdmin();

  try {
    await updateReviewModerationStatus(
      action,
      {
        reviewId,
        reason: getTextValue(formData, "reason"),
        adminNote: getTextValue(formData, "adminNote")
      },
      {
        userId: session.user.id,
        role: "admin"
      }
    );
  } catch (error) {
    if (error instanceof AdminModerationError) {
      redirect(getAdminReviewPath(reviewId, `error-${error.code}`));
    }

    console.error("[Xreviews admin] Failed to update review status", error);
    redirect(getAdminReviewPath(reviewId, "error-update"));
  }

  redirect(getAdminReviewPath(reviewId, action));
}

export async function approveReviewAction(reviewId: string, formData: FormData) {
  await runModerationAction("approve", reviewId, formData);
}

export async function disputeReviewAction(reviewId: string, formData: FormData) {
  await runModerationAction("dispute", reviewId, formData);
}

export async function hideReviewAction(reviewId: string, formData: FormData) {
  await runModerationAction("hide", reviewId, formData);
}

export async function removeReviewAction(reviewId: string, formData: FormData) {
  await runModerationAction("remove", reviewId, formData);
}
