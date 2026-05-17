# 03 — Data Model

## Naming conventions

- snake_case in database
- camelCase in TypeScript objects
- UUID primary keys unless a strong reason exists otherwise
- Timestamps: `created_at`, `updated_at`
- Soft deletion via status fields, not hard delete for sensitive data

## Core entities

| Entity | Purpose |
|---|---|
| users | User profiles |
| accounts/sessions | BetterAuth auth tables |
| subjects | Review targets: clinics, agencies, auto shops |
| subject_locations | Address/location metadata |
| reviews | Complaint reviews |
| risk_tags | Taxonomy tags |
| review_risk_tags | Review-tag join table |
| review_evidence | Evidence metadata and R2 object keys |
| business_claims | Business ownership claims |
| business_profiles | Official business pages |
| business_responses | Official replies to reviews |
| business_improvement_posts | Improvement posts |
| moderation_cases | Review/report moderation state |
| legal_requests | Takedown, dispute, correction requests |
| audit_logs | Sensitive state-change logs |
| risk_scores | Precomputed subject risk score |
| analytics_events | Product event tracking mirror |

## Status enums

### Review status

| Status | Meaning |
|---|---|
| draft | User has not submitted |
| pending | Awaiting moderation |
| published | Public |
| disputed | Business/user/legal dispute active |
| hidden | Temporarily hidden |
| removed | Removed after moderation/legal process |

### Subject status

| Status | Meaning |
|---|---|
| pending | Newly created, needs admin review |
| active | Public |
| merged | Duplicate merged into another subject |
| hidden | Hidden by admin |

### Claim status

| Status | Meaning |
|---|---|
| pending | Awaiting admin verification |
| approved | Official account active |
| rejected | Claim rejected |
| revoked | Previously approved but revoked |

## Category taxonomy

```text
medical_clinic
  dermatology
  korean_medicine
  cosmetic_clinic
  surgery_clinic
real_estate
  agency
  officetel
  apartment
  villa
  room
auto_repair
  repair_shop
  detailing
  tire
  inspection
```

## Risk tag examples

### Medical

- price_mismatch
- pressure_sales
- refund_issue
- long_wait
- hygiene_issue
- ad_mismatch
- consultation_issue
- staff_attitude
- contract_issue

### Real estate

- fake_listing_suspected
- price_changed
- maintenance_fee_mismatch
- room_condition_mismatch
- contract_pressure
- photo_mismatch
- agent_response_issue

### Auto repair

- overrepair_suspected
- estimate_mismatch
- issue_recurred
- parts_explanation_missing
- repair_without_consent
- invoice_issue
- aftercare_issue

## Evidence levels

| Level | Meaning |
|---:|---|
| 0 | No evidence |
| 1 | Detailed text only |
| 2 | Screenshot or simple image |
| 3 | Receipt/estimate/contract/document |
| 4 | Multiple evidence types |
| 5 | Official/public source or admin-verified document |

## Trust scoring MVP

Do not attempt to prove truth. Score evidence and repeatability.

```text
review_trust_score =
  evidence_level * 15
  + has_author_liability_confirmation * 10
  + user_account_age_weight
  + subject_repeat_pattern_weight
  - report_penalty
```

Cap 0 to 100.

## Critical audit events

Log all of these:

- review submitted
- review approved
- review hidden
- review disputed
- review removed
- business claim submitted
- business claim approved/rejected
- business response created/edited/deleted
- improvement post created/edited/deleted
- legal request submitted
- admin role changed
