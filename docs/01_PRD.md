# 01 — Product Requirements Document

## Product name

Xreviews

## MVP goal

Build a public SEO-friendly complaint-only platform for three categories: medical clinics (`medical_clinic`), real estate agencies (`real_estate`), and auto repair shops (`auto_repair`).

## Non-negotiable product requirements

| Requirement | Description |
|---|---|
| Complaint-only | Positive reviews are blocked or forced to rewrite. |
| Evidence-aware | Evidence is not mandatory for every review, but it affects visibility/trust. |
| Business response | Businesses can claim pages and reply. |
| Improvement posts | Businesses can publish official improvement updates. |
| Admin moderation | Admin can approve, hide, dispute, remove, and log actions. |
| SEO public pages | Subject and review pages should be indexable unless hidden/disputed. |
| No pay-to-delete | Payment can unlock response/analytics, not deletion. |

## Core flows

### Flow A — Visitor searches subject

1. User lands on homepage.
2. User searches clinic/agency/repair shop name.
3. Search returns subjects by category and location.
4. User opens public subject page.
5. User sees X-risk score, complaint tags, complaint list, business status.

### Flow B — User creates subject

1. Authenticated user searches and cannot find subject.
2. User clicks “대상 등록”.
3. User selects category.
4. User fills name, address/location optional, website/phone optional.
5. Subject is created with `pending` or `active` status depending on admin policy.

### Flow C — User writes complaint-only review

1. User selects subject.
2. User selects problem type tags.
3. User writes one-line avoid point.
4. User writes detailed problem body.
5. System checks positive/praise-only content.
6. User uploads optional evidence.
7. User confirms author liability statement.
8. Review enters `pending` state.
9. Admin approves to `published`.

### Flow D — Business claims official account

1. Business owner clicks “공식 계정 인증”.
2. Owner submits business identity fields.
3. Admin approves claim.
4. Business can reply and post improvements.
5. Business sees Basic subscription placeholder at KRW 4,900/month.

### Flow E — Admin moderates

1. Admin opens queue.
2. Admin sees review body, tags, evidence metadata, risk flags.
3. Admin can approve, hide, request evidence, mark disputed, remove.
4. Every action writes audit log.

## MVP pages

| Route | Page | Public/Auth |
|---|---|---|
| `/` | Home | Public |
| `/search` | Search results | Public |
| `/categories/medical-clinic` | Medical clinic category | Public |
| `/categories/real-estate` | Real estate category | Public |
| `/categories/auto-repair` | Auto repair category | Public |
| `/s/[slug]` | Subject detail | Public |
| `/review/new` | New complaint | Auth |
| `/business/claim` | Claim business | Auth |
| `/business/dashboard` | Business dashboard | Business |
| `/admin` | Admin overview | Admin |
| `/admin/moderation` | Moderation queue | Admin |
| `/admin/legal-requests` | Takedown/dispute requests | Admin |
| `/pricing` | Business pricing | Public |
| `/auth/sign-in` | Sign in | Public |
| `/auth/sign-up` | Sign up | Public |

## Public subject page modules

1. Header
   - Subject name
   - Category
   - Location
   - Official badge status
2. X-risk score
   - 0 to 100
   - Explain as complaint intensity, not objective guilt
3. Repeated complaints
   - Top tags
   - Recent counts
4. Review list
   - Title
   - Problem summary
   - Tags
   - Evidence level
   - Business reply status
5. Business response area
   - Official replies
   - Improvement posts
6. CTA
   - “이 대상의 불만 작성하기”
   - “공식 계정 인증하기”

## Complaint review fields

| Field | Required | Notes |
|---|---:|---|
| Subject | Yes | Existing or newly created |
| Category | Yes | medical_clinic, real_estate, auto_repair |
| Problem tags | Yes | At least 1 |
| Title | Yes | One-line avoid point |
| Body | Yes | Problem-focused detail |
| Evidence | No | Strongly encouraged |
| Author liability confirmation | Yes | Must be checked |
| Positive content check | Yes | Automatic rule-based first pass |

## Positive-content rule

Block if:

- No problem tags selected.
- Body contains only praise or neutral description.
- Title/body includes praise without a clear complaint.
- Sentiment appears positive and no risk terms are present.

Rewrite message:

> Xreviews는 좋은 점을 받지 않습니다. 다른 사람이 피해야 할 문제만 적어주세요.

## Ranking logic MVP

Initial score can be simple and deterministic:

```text
risk_score =
  published_review_count * 8
  + evidence_weight_sum
  + repeated_tag_weight
  + recent_review_weight
  - resolved_weight
```

Cap at 100.

Evidence weights:

| Evidence level | Weight |
|---|---:|
| none | 0 |
| text-only detail | 1 |
| receipt/document | 3 |
| photo/video | 3 |
| multiple evidence types | 5 |
| official/public source | 8 |

## Acceptance criteria

- Users cannot submit praise-only reviews.
- Reviews are pending until approved by admin.
- Subject pages render published complaints only.
- Business replies are visually separate from consumer reviews.
- Improvement posts are visually separate from review deletion/appeasement.
- Admin actions are logged.
