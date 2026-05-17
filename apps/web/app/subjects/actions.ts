"use server";

import { redirect } from "next/navigation";
import {
  createSubjectInputSchema,
  mvpCategorySchema
} from "@xreviews/validators";
import {
  createSubject,
  DatabaseUnavailableError
} from "@/server/subjects";
import { requireUser, USER_ROLES, type UserRole } from "@/server/session";

function normalizeRole(value: unknown): UserRole {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : "user";
}

function getCategoryQuery(value: unknown) {
  const parsed = mvpCategorySchema.safeParse(value);
  return parsed.success ? `&category=${parsed.data}` : "";
}

function getSubjectPath(slug: string, query: "created" | "duplicate") {
  return `/subjects/${encodeURIComponent(slug)}?${query}=1`;
}

export async function createSubjectAction(formData: FormData) {
  const session = await requireUser();
  const parsed = createSubjectInputSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    address: formData.get("address"),
    city: formData.get("city"),
    district: formData.get("district"),
    phone: formData.get("phone"),
    website: formData.get("website")
  });

  if (!parsed.success) {
    redirect(`/subjects/new?error=invalid${getCategoryQuery(formData.get("category"))}`);
  }

  let result: Awaited<ReturnType<typeof createSubject>>;

  try {
    result = await createSubject(parsed.data, {
      userId: session.user.id,
      role: normalizeRole(session.user.role)
    });
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      redirect("/subjects/new?error=database");
    }

    console.error("[Xreviews subjects] Failed to create subject", error);
    redirect("/subjects/new?error=create");
  }

  if (result.status === "duplicate") {
    redirect(getSubjectPath(result.subject.slug, "duplicate"));
  }

  redirect(getSubjectPath(result.subject.slug, "created"));
}
