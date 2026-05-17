# Xreviews

Xreviews는 긍정 리뷰를 받지 않는 부정 경험 전용 리뷰 플랫폼입니다.

핵심 출발점:

> 혹시 리뷰 볼 때, 1점부터 보시나요?

좋은 후기는 이미 충분합니다. Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.

## Phase 상태

현재 repo는 Phase 6 구현 단계입니다.

- Phase 0: Cloudflare 배포 전제 TypeScript/Next.js App Router scaffold
- Phase 1: Neon Postgres + Drizzle ORM 핵심 DB schema/migration/seed 구조
- Phase 2: BetterAuth + Resend 기반 magic link 인증 구조
- Phase 3: subject 생성/검색/상세 skeleton
- Phase 4: 부정 경험 전용 불만 작성/검증/pending 저장
- Phase 5: Cloudflare R2 private evidence upload flow
- Phase 6: 관리자 모더레이션 큐와 review status 전환

아직 사업자 claim, 사업자 답변, 랭킹, 결제, Qdrant, AI 요약 기능은 구현하지 않았습니다.

## Stack

- TypeScript
- Next.js App Router
- Tailwind CSS
- Cloudflare Workers/Pages via OpenNext Cloudflare adapter
- Neon Postgres
- Drizzle ORM
- BetterAuth
- Resend
- R2 in later phases
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
```

`pnpm deploy`는 Cloudflare 계정, `wrangler` 로그인, production 환경변수, R2 bucket 준비 후 실행합니다.

`pnpm admin:promote`는 개발/운영 점검용 CLI입니다. 웹 UI에서 admin 승격 기능을 만들지 않으며, production에서는 승인된 운영 절차 안에서만 사용해야 합니다.

## Environment

루트의 `.env.example`을 참고해 로컬 `.env.local`을 만들 수 있습니다. 로컬 화면과 빌드는 secret 없이도 죽지 않지만, 실제 magic link 인증 요청에는 `DATABASE_URL`이 필요합니다. `RESEND_API_KEY`가 없으면 개발환경에서는 이메일을 mock log로 남기고 실패하지 않습니다. Production 검증은 `packages/config/env.ts`의 `validateProductionEnv()`가 명확한 에러를 내도록 분리되어 있습니다.

## Product rules

- Xreviews는 긍정 리뷰를 받지 않습니다.
- “1점부터 본다”는 기존 플랫폼에서의 사용자 행동을 설명하는 카피이며, Xreviews 자체에는 별점 UI가 없습니다.
- MVP 카테고리는 `medical_clinic`, `real_estate`, `auto_repair`만 허용합니다.
- 인물 리뷰 대상은 만들지 않습니다.
- 신규 리뷰는 승인 전까지 공개되지 않습니다.
- 사업자는 리뷰를 삭제할 수 없습니다.
- 증거 파일은 private-by-default입니다.
