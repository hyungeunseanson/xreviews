"use server";

import { redirect } from "next/navigation";
import { BusinessError, updateBusinessClaimStatus } from "@/server/business";
import { captureAppError } from "@/lib/observability";
import { requireAdmin } from "@/server/session";

type ClaimAction = "approve" | "reject" | "revoke";

function getClaimPath(claimId: string, result: string) {
  return `/admin/business-claims/${encodeURIComponent(claimId)}?result=${result}`;
}

function getAdminNote(formData: FormData) {
  const value = formData.get("adminNote");
  return typeof value === "string" ? value : undefined;
}

async function runClaimAction(
  action: ClaimAction,
  claimId: string,
  formData: FormData
) {
  const session = await requireAdmin();
  const nextStatusByAction = {
    approve: "approved",
    reject: "rejected",
    revoke: "revoked"
  } as const;

  try {
    await updateBusinessClaimStatus(
      nextStatusByAction[action],
      {
        claimId,
        adminNote: getAdminNote(formData)
      },
      {
        userId: session.user.id,
        role: "admin"
      }
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      redirect(getClaimPath(claimId, `error-${error.code}`));
    }

    await captureAppError(error, {
      area: "admin",
      action: "update_business_claim",
      extra: {
        status: nextStatusByAction[action]
      }
    });
    console.error("[Xreviews admin] Failed to update business claim", error);
    redirect(getClaimPath(claimId, "error-update"));
  }

  redirect(getClaimPath(claimId, action));
}

export async function approveBusinessClaimAction(
  claimId: string,
  formData: FormData
) {
  await runClaimAction("approve", claimId, formData);
}

export async function rejectBusinessClaimAction(
  claimId: string,
  formData: FormData
) {
  await runClaimAction("reject", claimId, formData);
}

export async function revokeBusinessClaimAction(
  claimId: string,
  formData: FormData
) {
  await runClaimAction("revoke", claimId, formData);
}
