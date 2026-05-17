"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, isAuthDatabaseConfigured } from "@/lib/auth";

const emailSchema = z.string().trim().email();

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://localhost:3000"
  );
}

export async function requestMagicLink(formData: FormData) {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));

  if (!parsedEmail.success) {
    redirect("/login?error=invalid-email");
  }

  if (!isAuthDatabaseConfigured()) {
    redirect("/login?error=missing-database-url");
  }

  const appUrl = getAppUrl();

  try {
    await auth.api.signInMagicLink({
      body: {
        email: parsedEmail.data,
        callbackURL: `${appUrl}/account`,
        newUserCallbackURL: `${appUrl}/account`,
        errorCallbackURL: `${appUrl}/login?error=magic-link`
      },
      headers: await headers()
    });
  } catch (error) {
    console.error("[Xreviews auth] Failed to request magic link", error);
    redirect("/login?error=magic-link");
  }

  redirect("/auth/check-email");
}

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers()
    });
  } catch (error) {
    console.error("[Xreviews auth] Failed to sign out", error);
  }

  redirect("/");
}
