"use client";

import {
  type AnalyticsEventName,
  type AnalyticsPayload,
  sanitizeAnalyticsPayload
} from "@/lib/analytics/events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function trackAnalyticsEvent<Name extends AnalyticsEventName>(
  eventName: Name,
  payload: AnalyticsPayload<Name>
) {
  if (typeof window === "undefined") {
    return;
  }

  const safePayload = sanitizeAnalyticsPayload(payload);

  window.gtag?.("event", eventName, safePayload);
  window.clarity?.("event", eventName);
}
