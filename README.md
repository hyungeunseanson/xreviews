# Xreviews

Xreviews는 긍정 리뷰를 받지 않는 부정 경험 전용 리뷰 플랫폼입니다.

핵심 출발점:

> 혹시 리뷰 볼 때, 1점부터 보시나요?

좋은 후기는 이미 충분합니다. Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.

## Phase 상태

현재 repo는 Phase 12 구현 단계입니다.

- Phase 0: Cloudflare 배포 전제 TypeScript/Next.js App Router scaffold
- Phase 1: Neon Postgres + Drizzle ORM 핵심 DB schema/migration/seed 구조
- Phase 2: BetterAuth + Resend 기반 magic link 인증 구조
- Phase 3: subject 생성/검색/상세 skeleton
- Phase 4: 부정 경험 전용 불만 작성/검증/pending 저장
- Phase 5: Cloudflare R2 private evidence upload flow
- Phase 6: 관리자 모더레이션 큐와 review status 전환
- Phase 7: 사업자 공식 계정, 공식 답변, 개선 포스트, 구독 skeleton
- Phase 8: X-risk score와 공개 랭킹
- Phase 9: Sentry/GA4/Clarity placeholder, 내부 analytics event helper, 배포 런북
- Phase 10: public launch 전 기능/권한/운영 회귀 점검
- Phase 11: 클로즈드 베타 운영 정책/법무/운영 문서 패키지
- Phase 12: 클로즈드 베타 staging/production-like 배포 준비

아직 결제, Qdrant, AI 요약, 지도, 알림, 데이터 API, 소비자 프리미엄 기능은 구현하지 않았습니다.

## Stack

- TypeScript
- Next.js App Router
- Tailwind CSS
- Cloudflare Workers/Pages via OpenNext Cloudflare adapter
- Neon Postgres
- Drizzle ORM
- BetterAuth
- Resend
- Cloudflare R2
- Sentry, GA4, Microsoft Clarity placeholders

금지 스택:

- Vercel
- Supabase
- Pinecone

## Local setup

pnpm이 없으면 Corepack으로 활성화합니다.

```bash
corepack prepare pnpm@10.33.4 --activate
pnpm install
pnpm dev
```

웹 앱은 기본적으로 `http://localhost:3000`에서 실행됩니다.

## Commands

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm cf:build
pnpm deploy
pnpm admin:promote --email=admin@example.com
pnpm risk:recalculate
```

`pnpm deploy`는 Cloudflare 계정, `wrangler` 로그인, production 환경변수, R2 bucket 준비 후 실행합니다.

`pnpm admin:promote`는 개발/운영 점검용 CLI입니다. 웹 UI에서 admin 승격 기능을 만들지 않으며, production에서는 승인된 운영 절차 안에서만 사용해야 합니다.

## Environment

루트의 `.env.example`을 참고해 로컬 `.env.local`을 만들 수 있습니다. 로컬 화면과 빌드는 secret 없이도 죽지 않지만, 실제 magic link 인증 요청에는 `DATABASE_URL`이 필요합니다. `RESEND_API_KEY`가 없으면 개발환경에서는 이메일을 mock log로 남기고 실패하지 않습니다. Production 검증은 `packages/config/env.ts`의 `validateProductionEnv()`가 명확한 에러를 내도록 분리되어 있습니다.

필수 env 후보:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`

`.env.local`은 git에 포함하지 않습니다.

## Observability and analytics

에러 추적은 Sentry placeholder를 사용합니다. `SENTRY_DSN`이 없으면 비활성 상태로 동작하고 local dev/build를 깨지 않습니다.

행동 분석은 GA4와 Microsoft Clarity placeholder를 사용합니다. `NEXT_PUBLIC_GA_MEASUREMENT_ID`와 `NEXT_PUBLIC_CLARITY_PROJECT_ID`가 있을 때만 script가 로드됩니다.

내부 analytics helper는 다음 이벤트 계약을 갖습니다: `search_performed`, `subject_viewed`, `subject_created`, `review_started`, `review_submitted`, `positive_review_blocked`, `medical_guardrail_blocked`, `evidence_upload_started`, `evidence_uploaded`, `business_claim_started`, `business_claim_submitted`, `business_response_created`, `business_improvement_post_created`, `moderation_action_taken`, `ranking_viewed`, `ranking_subject_clicked`, `login_started`, `login_completed`.

analytics payload에는 raw review body, evidence object key, upload URL, signed URL, public URL, 이메일 원문, 전화번호 원문을 보내지 않습니다.

## Product rules

- Xreviews는 긍정 리뷰를 받지 않습니다.
- “1점부터 본다”는 기존 플랫폼에서의 사용자 행동을 설명하는 카피이며, Xreviews 자체에는 별점 UI가 없습니다.
- MVP 카테고리는 `medical_clinic`, `real_estate`, `auto_repair`만 허용합니다.
- 인물 리뷰 대상은 만들지 않습니다.
- 신규 리뷰는 승인 전까지 공개되지 않습니다.
- 사업자는 리뷰를 삭제할 수 없습니다.
- 증거 파일은 private-by-default입니다.

## Closed Beta Readiness

Phase 11 adds the closed beta policy and operations package. These documents are working drafts for product/legal-ops review and do not replace advice from a licensed attorney.

Closed beta launch should not begin until the documents below are reviewed against the actual operating process, support inboxes, and jurisdiction-specific legal requirements.

Phase 12 adds production-like staging readiness docs:

- [Environment checklist](docs/beta/ENVIRONMENT_CHECKLIST.md)
- [Staging smoke test checklist](docs/beta/STAGING_SMOKE_TEST_CHECKLIST.md)
- [Contact channel registry](docs/legal-ops/CONTACT_CHANNELS.md)

## Legal/Ops Documents

- [Terms draft](docs/legal-ops/TERMS_DRAFT.md)
- [Privacy policy draft](docs/legal-ops/PRIVACY_POLICY_DRAFT.md)
- [Rights infringement and takedown policy](docs/legal-ops/RIGHTS_INFRINGEMENT_AND_TAKEDOWN_POLICY.md)

## Policies

- [Review policy](docs/legal-ops/REVIEW_POLICY.md)
- [Prohibited content policy](docs/legal-ops/PROHIBITED_CONTENT_POLICY.md)
- [Business right of reply policy](docs/legal-ops/BUSINESS_RIGHT_OF_REPLY_POLICY.md)

## Moderation Playbook

- [Moderation playbook](docs/legal-ops/MODERATION_PLAYBOOK.md)
- [Beta QA script](docs/legal-ops/BETA_QA_SCRIPT.md)

## Incident Response

- [Incident response playbook](docs/legal-ops/INCIDENT_RESPONSE_PLAYBOOK.md)

## Before Public Launch

- Have licensed counsel review terms, privacy, takedown, and business reply language.
- Replace placeholder contact emails with real monitored inboxes.
- Verify positive-review block, medical guardrail, pending-only privacy, evidence private-by-default, business no-delete boundary, admin-only approval, and ranking published-only behavior.
- Confirm Cloudflare R2, Neon, BetterAuth, Resend, Sentry, GA4, and Clarity production settings.
- Run a small closed beta using [Closed beta plan](docs/legal-ops/CLOSED_BETA_PLAN.md) before opening public access.
