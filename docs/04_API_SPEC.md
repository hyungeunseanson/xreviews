# 04 — API Specification

## API principles

- All mutation endpoints require authentication unless explicitly public.
- All inputs validated with Zod or equivalent.
- All sensitive mutations write `audit_logs`.
- Use JSON responses.
- Never return raw private R2 object keys to public clients unless needed for signed URL flow.

## Auth

BetterAuth should own session/auth routes. Codex must wire BetterAuth according to current official package APIs and use Neon/Drizzle-compatible storage.

## Public endpoints

### GET `/api/subjects`

Search subjects.

Query params:

| Param | Type | Required |
|---|---|---:|
| q | string | No |
| category | medical_clinic / real_estate / auto_repair | No |
| region | string | No |
| limit | number | No |
| cursor | string | No |

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "OO피부과",
      "slug": "oo-dermatology-gangnam",
      "category": "medical_clinic",
      "subcategory": "dermatology",
      "locationLabel": "서울 강남구",
      "riskScore": 82,
      "publishedReviewCount": 12,
      "officialBadgeEnabled": false
    }
  ],
  "nextCursor": null
}
```

### GET `/api/subjects/:slug`

Return public subject detail.

Include:

- Subject
- Risk score
- Top risk tags
- Published reviews
- Business profile
- Business improvement posts

### GET `/api/rankings`

Query params:

- category
- period: today, week, month, all
- region optional

Response sorted by risk score/recent complaints.

## Authenticated user endpoints

### POST `/api/subjects`

Create subject.

Body:

```json
{
  "name": "OO피부과",
  "category": "medical_clinic",
  "subcategory": "dermatology",
  "addressLine": "서울 강남구 ...",
  "region": "서울",
  "city": "서울",
  "district": "강남구",
  "websiteUrl": "https://example.com",
  "phone": "02-000-0000"
}
```

Validation:

- name required
- category required
- no person names as subject unless it is a valid business/organization subject

### POST `/api/reviews`

Create complaint review.

Body:

```json
{
  "subjectId": "uuid",
  "title": "상담가와 결제 금액이 달랐습니다",
  "body": "예약 전에 안내받은 금액과 실제 상담 후 제시된 금액이 달랐고...",
  "riskTagIds": ["uuid"],
  "severityScore": 60,
  "authorLiabilityConfirmed": true
}
```

Validation:

- Must be signed in.
- `riskTagIds.length >= 1`.
- `title.length` reasonable.
- `body.length >= 30`.
- `authorLiabilityConfirmed === true`.
- Reject praise-only body.
- If subject category is medical, block definitive medical causation/diagnosis claims with rewrite warning or admin flag.

Response:

```json
{
  "reviewId": "uuid",
  "status": "pending"
}
```

### POST `/api/reviews/:id/evidence/upload-url`

Create signed upload URL or direct upload token for private R2 object.

Body:

```json
{
  "filename": "receipt.jpg",
  "contentType": "image/jpeg",
  "evidenceType": "receipt",
  "fileSizeBytes": 123456
}
```

Response:

```json
{
  "uploadUrl": "signed-url",
  "objectKey": "private/reviews/...",
  "evidenceId": "uuid"
}
```

### POST `/api/reviews/:id/report`

Report a review.

Body:

```json
{
  "reason": "privacy|false_information|abuse|other",
  "body": "..."
}
```

## Business endpoints

### POST `/api/business/claims`

Submit business claim.

Body:

```json
{
  "subjectId": "uuid",
  "businessName": "OO피부과",
  "registrationNumber": "optional",
  "contactEmail": "owner@example.com",
  "contactPhone": "010-0000-0000"
}
```

### POST `/api/business/responses`

Official reply to a review.

Body:

```json
{
  "reviewId": "uuid",
  "body": "공식 답변입니다...",
  "responseType": "explanation"
}
```

Rules:

- User must own approved business profile for subject.
- Reply is public by default.
- Write audit log.

### POST `/api/business/improvement-posts`

Create improvement post.

Body:

```json
{
  "subjectId": "uuid",
  "title": "상담 가격 안내 방식을 개선했습니다",
  "body": "...",
  "category": "price_policy"
}
```

## Admin endpoints

### GET `/api/admin/moderation-cases`

Admin only.

### POST `/api/admin/reviews/:id/approve`

Sets review to `published`, sets `published_at`, recalculates risk score, writes audit log.

### POST `/api/admin/reviews/:id/hide`

Sets review to `hidden`, writes moderation case and audit log.

### POST `/api/admin/reviews/:id/dispute`

Sets review to `disputed`, writes moderation case and audit log.

### POST `/api/admin/business-claims/:id/approve`

Creates/updates business profile, enables official badge if policy allows, writes audit log.

### POST `/api/admin/legal-requests/:id/action`

Updates legal request status and audit log.

## Error format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Xreviews는 좋은 점을 받지 않습니다. 다른 사람이 피해야 할 문제만 적어주세요.",
    "details": {}
  }
}
```
