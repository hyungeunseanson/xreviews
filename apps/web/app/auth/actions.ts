"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, isAuthDatabaseConfigured } from "@/lib/auth";
import { captureAppError } from "@/lib/observability";
import { recordAnalyticsEvent } from "@/server/analytics";

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
    await recordAnalyticsEvent("login_started", {});
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
    await captureAppError(error, {
      area: "auth",
      action: "request_magic_link"
    });
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
    await captureAppError(error, {
      area: "auth",
      action: "sign_out"
    });
    console.error("[Xreviews auth] Failed to sign out", error);
  }

  redirect("/");
}
