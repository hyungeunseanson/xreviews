export function getSentryStatus(env: Record<string, string | undefined> = process.env) {
  return {
    configured: Boolean(env.SENTRY_DSN),
    note:
      "Sentry SDK is intentionally not wired in Phase 0. Add SDK setup when real error capture starts."
  };
}
