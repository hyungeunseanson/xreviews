import { captureException } from "@sentry/core";
import { sanitizeAnalyticsPayload } from "@/lib/analytics/events";

type SentryStatus = {
  enabled: boolean;
  reason: "configured" | "missing_dsn";
};

let status: SentryStatus | null = null;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.slice(0, 240)
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error.slice(0, 240) : "Unknown error"
  };
}

export function initializeSentry(
  env: Record<string, string | undefined> = process.env
): SentryStatus {
  if (status) {
    return status;
  }

  const dsn = env.SENTRY_DSN?.trim();

  status = dsn
    ? { enabled: true, reason: "configured" }
    : { enabled: false, reason: "missing_dsn" };

  return status;
}

export function getSentryStatus(
  env: Record<string, string | undefined> = process.env
) {
  return initializeSentry(env);
}

export async function captureSentryException(
  error: unknown,
  context: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  } = {}
) {
  const currentStatus = initializeSentry();

  if (!currentStatus.enabled) {
    return null;
  }

  const safeContext = {
    tags: context.tags,
    extra: sanitizeAnalyticsPayload(context.extra)
  };

  // Phase 9 keeps Sentry as a Cloudflare-safe placeholder. Wire the real SDK
  // once the deployment target and source-map upload strategy are finalized.
  const safeError = serializeError(error);

  captureException(safeError, safeContext);
  console.error("[Xreviews Sentry placeholder]", safeError, safeContext);

  return "sentry-placeholder-event";
}
