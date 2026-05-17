# 09 — Analytics and KPI Spec

## Tools

- GA4 for traffic/acquisition/product events
- Microsoft Clarity for heatmaps/session replay UX learning
- Sentry for errors/performance
- Internal `analytics_events` table for core product metrics

## North Star Metric

Verified risk-avoidance actions.

## Core events

| Event | Trigger |
|---|---|
| search_performed | User submits search |
| subject_viewed | User opens subject page |
| review_started | User opens new review form |
| review_positive_blocked | Positive/praise-only content blocked |
| review_submitted | Review submitted pending moderation |
| evidence_upload_started | Upload URL created |
| evidence_uploaded | Evidence metadata saved |
| business_claim_started | Claim form opened |
| business_claim_submitted | Claim submitted |
| business_reply_submitted | Business reply posted |
| improvement_post_created | Improvement post created |
| legal_request_submitted | Legal/takedown request submitted |
| ranking_viewed | Ranking page viewed |
| share_clicked | User shares subject/review |

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
    "risk_score": 82,
    "source": "search"
  }
}
```

## Privacy

Do not send sensitive review body or evidence filenames to GA4/Clarity.

Use internal analytics table for product events and sanitize PII.
