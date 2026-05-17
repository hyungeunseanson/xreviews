# 08 — Business Official Account and Subscription Spec

## Product

Xreviews Official Account.

Businesses can claim their page, display an official badge, reply to complaints, and publish improvement posts.

## Critical rule

Payment never buys deletion.

Payment buys:

- identity verification
- response tools
- improvement communication
- analytics
- alerts

## Plans

| Plan | Price | Features |
|---|---:|---|
| Free Claim | 0 KRW | Claim request, limited profile, limited reply |
| Official Basic | 4,900 KRW/month | Official badge, unlimited replies, improvement posts |
| Official Pro | 29,000 KRW/month | Alerts, complaint analytics, tag trends |
| Multi-location | 99,000 KRW/month+ | Multi-branch dashboard |
| Data/API | Custom | Risk intelligence reports/API |

## MVP implementation

Do not implement payment processor in first build unless explicitly requested.

Implement:

- Pricing page
- Plan metadata in DB
- Subscription status fields
- Official Basic CTA
- “coming soon / contact” payment state

## Business dashboard modules

1. Official status
2. Recent complaints
3. Reply composer
4. Improvement post composer
5. Top complaint tags
6. Subscription teaser

## Official badge UI

Use label:

> 공식 인증 사업자

Other statuses:

- 공식계정 미인증
- 인증 대기 중
- 분쟁 중

## Improvement post examples

- 상담 가격 안내 방식을 개선했습니다.
- 환불 안내 문구를 수정했습니다.
- 예약 대기 프로세스를 변경했습니다.
- 시설/위생 점검을 완료했습니다.
