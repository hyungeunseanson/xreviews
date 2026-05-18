"use server";

import { redirect } from "next/navigation";
import {
  BusinessError,
  createBusinessImprovementPost,
  updateBusinessImprovementPost,
  upsertBusinessResponse
} from "@/server/business";
import { captureAppError } from "@/lib/observability";
import { requireBusinessOrAdmin } from "@/server/session";

function getDashboardPath(subjectId: string, result: string) {
  return `/business/subjects/${encodeURIComponent(subjectId)}?result=${result}`;
}

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item : undefined;
}

function getActorFromSession(session: Awaited<ReturnType<typeof requireBusinessOrAdmin>>) {
  return {
    userId: session.user.id,
    role: session.user.role
  };
}

export async function upsertBusinessResponseAction(
  subjectId: string,
  reviewId: string,
  formData: FormData
) {
  const session = await requireBusinessOrAdmin();

  try {
    await upsertBusinessResponse(
      {
        reviewId,
        responseType: value(formData, "responseType"),
        body: value(formData, "body")
      },
      getActorFromSession(session)
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      redirect(getDashboardPath(subjectId, `error-${error.code}`));
    }

    await captureAppError(error, {
      area: "business",
      action: "upsert_response",
      extra: {
        subjectId,
        reviewId
      }
    });
    console.error("[Xreviews business] Failed to write response", error);
    redirect(getDashboardPath(subjectId, "error-invalid"));
  }

  redirect(getDashboardPath(subjectId, "response"));
}

export async function createBusinessImprovementPostAction(
  subjectId: string,
  formData: FormData
) {
  const session = await requireBusinessOrAdmin();

  try {
    await createBusinessImprovementPost(
      {
        subjectId,
        title: value(formData, "title"),
        body: value(formData, "body"),
        category: value(formData, "category")
      },
      getActorFromSession(session)
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      redirect(getDashboardPath(subjectId, `error-${error.code}`));
    }

    await captureAppError(error, {
      area: "business",
      action: "create_improvement_post",
      extra: {
        subjectId
      }
    });
    console.error("[Xreviews business] Failed to create improvement post", error);
    redirect(getDashboardPath(subjectId, "error-invalid"));
  }

  redirect(getDashboardPath(subjectId, "improvement"));
}

export async function updateBusinessImprovementPostAction(
  subjectId: string,
  postId: string,
  formData: FormData
) {
  const session = await requireBusinessOrAdmin();

  try {
    await updateBusinessImprovementPost(
      {
        postId,
        title: value(formData, "title"),
        body: value(formData, "body"),
        category: value(formData, "category")
      },
      getActorFromSession(session)
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      redirect(getDashboardPath(subjectId, `error-${error.code}`));
    }

    await captureAppError(error, {
      area: "business",
      action: "update_improvement_post",
      extra: {
        subjectId
      }
    });
    console.error("[Xreviews business] Failed to update improvement post", error);
    redirect(getDashboardPath(subjectId, "error-invalid"));
  }

  redirect(getDashboardPath(subjectId, "improvement-updated"));
}
