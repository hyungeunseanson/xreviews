import { auditLogs } from "@xreviews/db/schema";
import {
  buildAnalyticsMetadata,
  type AnalyticsEventName,
  type AnalyticsPayload
} from "@/lib/analytics/events";
import { tryGetServerDb } from "@/server/db";
import type { UserRole } from "@/server/session";

type AnalyticsActor = {
  actorUserId?: string | null;
  actorRole?: UserRole;
};

function getTarget(input: Record<string, unknown>) {
  if (typeof input.reviewId === "string") {
    return { targetType: "review", targetId: input.reviewId };
  }

  if (typeof input.subjectId === "string") {
    return { targetType: "subject", targetId: input.subjectId };
  }

  return { targetType: "analytics_event", targetId: null };
}

export async function recordAnalyticsEvent<Name extends AnalyticsEventName>(
  eventName: Name,
  payload: AnalyticsPayload<Name>,
  actor: AnalyticsActor = {}
) {
  const db = tryGetServerDb();

  if (!db) {
    return;
  }

  const target = getTarget(payload);

  await db.insert(auditLogs).values({
    actorUserId: actor.actorUserId ?? null,
    actorRole: actor.actorRole ?? "user",
    action: eventName,
    targetType: target.targetType,
    targetId: target.targetId,
    metadata: buildAnalyticsMetadata(eventName, payload)
  });
}
