# 06 — Moderation and Legal Ops

## Position

Legal pressure is expected if the product works. The goal is not to make Xreviews harmless. The goal is to make it resilient, auditable, and operationally defensible.

This document is not legal advice. It is product/ops design.

## Core operating rules

1. Keep the brand radical.
2. Keep the data structured.
3. Keep the logs complete.
4. Make users confirm responsibility.
5. Give businesses a reply channel.
6. Never sell deletion.

## Content policy

### Allowed

- Problem-focused consumer experience
- Pricing mismatch
- Consultation/process complaints
- Waiting time complaints
- Hygiene/facility complaints
- Contract/refund issues
- Estimate/invoice mismatch
- Ad mismatch
- Pressure sales
- Evidence-backed claims

### Not allowed

- Doxxing/personal addresses
- National ID numbers, private phone numbers, private emails
- Slurs/hate speech
- Threats
- Calls for harassment
- Unverified definitive criminal accusations
- Medical diagnosis as fact by non-expert users
- Claims that identify individual staff unnecessarily
- Revenge posts unrelated to consumer experience

## Medical category rules

Use process-oriented tags and prompts.

Allowed prompts:

- 상담 과정에서 어떤 문제가 있었나요?
- 가격 안내가 실제 결제와 달랐나요?
- 환불/계약 관련 문제가 있었나요?
- 예약/대기/응대 과정에서 어떤 문제가 있었나요?

Avoid prompts like:

- 치료가 효과 있었나요?
- 의사가 오진했나요?
- 부작용 원인이 병원 때문인가요?

## Review status lifecycle

```text
draft
  → pending
    → published
    → hidden
    → disputed
    → removed
```

## Moderation actions

| Action | Use case | Public effect | Audit required |
|---|---|---|---:|
| approve | publishable complaint | visible | yes |
| hide | temporary risk/privacy/legal issue | hidden | yes |
| dispute | business/legal dispute active | visible with dispute badge or hidden by policy | yes |
| remove | policy/legal violation | removed | yes |
| request_evidence | serious claim lacks evidence | pending/hidden | yes |

## Takedown/dispute request flow

1. Requester submits legal/dispute form.
2. System creates `legal_requests` row.
3. Admin receives notification.
4. Admin reviews subject/review/evidence/logs.
5. Admin action options:
   - reject request
   - hide temporarily
   - request author evidence
   - allow business reply
   - remove content
   - mark disputed
6. All actions logged.

## Author responsibility statement

Required text:

> 나는 이 리뷰가 내 실제 경험에 기반하며, 허위 사실 작성 시 법적 책임이 나에게 있음을 확인합니다.

Store `author_liability_confirmed = true`.

## Abuse prevention

MVP controls:

- Authentication required to write reviews.
- Turnstile placeholder on signup/review creation.
- IP hash and user-agent hash stored.
- Rate limit placeholder.
- One user cannot spam same subject repeatedly.
- Admin queue required before publication.

## Business response policy

Businesses may:

- Reply to reviews
- Dispute specific claims
- Submit correction evidence
- Publish improvement posts

Businesses may not:

- Pay to delete reviews
- Publicly reveal reviewer identity
- Threaten users in official replies
- Use official reply as advertising spam

## Audit log data

Every sensitive action should log:

- Actor user ID
- Entity type
- Entity ID
- Action
- Before data
- After data
- IP hash
- Timestamp
