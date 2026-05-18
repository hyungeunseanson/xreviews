"use server";

import { redirect } from "next/navigation";
import { captureAppError } from "@/lib/observability";
import { BusinessError, submitBusinessClaim } from "@/server/business";
import { requireUser } from "@/server/session";

function getClaimPath(slug: string, result: string) {
  return `/subjects/${encodeURIComponent(slug)}/claim?result=${result}`;
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function submitBusinessClaimAction(
  slug: string,
  subjectId: string,
  formData: FormData
) {
  const session = await requireUser();

  try {
    await submitBusinessClaim(
      {
        subjectId,
        businessName: getOptionalString(formData, "businessName"),
        applicantName: getOptionalString(formData, "applicantName"),
        contactEmail: getOptionalString(formData, "contactEmail"),
        contactPhone: getOptionalString(formData, "contactPhone"),
        registrationNumber: getOptionalString(formData, "registrationNumber"),
        verificationNote: getOptionalString(formData, "verificationNote")
      },
      {
        userId: session.user.id,
        role: session.user.role
      }
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      redirect(getClaimPath(slug, `error-${error.code}`));
    }

    await captureAppError(error, {
      area: "business",
      action: "submit_claim",
      extra: {
        subjectId
      }
    });
    console.error("[Xreviews business] Failed to submit claim", error);
    redirect(getClaimPath(slug, "error-invalid"));
  }

  redirect(getClaimPath(slug, "submitted"));
}
