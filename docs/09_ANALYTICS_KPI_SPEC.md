# 09 — Analytics and KPI Spec

## Tools

- GA4 for traffic/acquisition/product events
- Microsoft Clarity for heatmaps/session replay UX learning
- Sentry for errors/performance
- Internal `search_events`, `share_events`, and sanitized `audit_logs` metadata for core product metrics

## North Star Metric

Verified risk-avoidance actions.

## Core events

| Event | Trigger |
|---|---|
| search_performed | User submits search |
| subject_viewed | User opens subject page |
| review_started | User opens new review form |
| subject_created | Logged-in user creates subject |
| positive_review_blocked | Positive/praise-only content blocked |
| medical_guardrail_blocked | Medical category safety copy blocks unsafe claim |
| review_submitted | Review submitted pending moderation |
| evidence_upload_started | Upload URL created |
| evidence_uploaded | Evidence metadata saved after private upload |
| business_claim_started | Claim form opened |
| business_claim_submitted | Claim submitted |
| business_response_created | Business official response posted |
| business_improvement_post_created | Improvement post created |
| moderation_action_taken | Admin moderation status action |
| ranking_viewed | Ranking page viewed |
| ranking_subject_clicked | User opens subject from ranking |
| login_started | Magic link requested |
| login_completed | Authenticated account page reached |

## KPI dashboard

| KPI | Why it matters |
|---|---|
| Search completion rate | Consumer demand |
| Subject page conversion to review start | Review collection potential |
| Review submit completion rate | UX quality |
| Positive block rate | Category purity |
| Evidence attachment rate | Data quality |
| Admin approval rate | Abuse/content quality |
| Report/dispute rate | Legal/ops pressure |
| Business claim rate | B2B monetization potential |
| Business reply rate | Platform loop strength |
| Ranking page engagement | Viral engine |

## Event payload baseline

```json
{
  "event_name": "subject_viewed",
  "anonymous_id": "anon-id",
  "user_id": "uuid-or-null",
  "subject_id": "uuid",
  "properties": {
    "category": "medical_clinic",
    "scoreRange": "81-100",
    "source": "search"
  }
}
```

## Privacy

Do not send sensitive review body, evidence filenames, evidence object keys, upload URLs, signed URLs, public evidence URLs, raw emails, or raw phone numbers to GA4/Clarity/Sentry.

Use allowlisted payload keys only. Store search query presence/result count instead of raw sensitive search text when possible.
