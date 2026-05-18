"use client";

import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  magicLinkClient
} from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

function getClientBaseURL() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [magicLinkClient(), inferAdditionalFields<typeof auth>()]
});

export type ClientSession = typeof authClient.$Infer.Session;
