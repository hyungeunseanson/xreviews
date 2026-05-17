# AGENTS.md — Xreviews Coding Rules for Codex

You are building Xreviews, a radical complaint-only review platform.

## Product identity

Xreviews does not accept positive reviews.

The product thesis is:

> People already look for the worst reviews first. Xreviews turns that habit into a product.

This is not a generic review app. This is a negative-experience data company. The public product must feel sharp, direct, and category-defining. The internal system must be evidence-first, logged, auditable, and operationally safe.

Core user insight:

> 혹시 리뷰를 찾아볼 때 1점부터, 혹은 나쁜 후기부터 먼저 찾아보는 편이신가요?

Xreviews does not force a new behavior. It productizes what consumers already do: check the worst experiences before trusting praise.

## Hard constraints

Do not use:

- Vercel
- Supabase
- Pinecone
- Firebase
- MongoDB
- Prisma unless explicitly requested later
- Paid-first services when a free/near-zero-cost alternative exists

Use:

- TypeScript
- Next.js App Router
- Cloudflare Workers/Pages deployment via OpenNext Cloudflare adapter
- Cloudflare R2 for evidence assets
- Cloudflare Turnstile for bot protection
- Cloudflare Queues for async jobs when needed
- Neon Postgres
- Drizzle ORM
- BetterAuth
- Resend
- Qdrant for vector/search phase, not mandatory for first CRUD milestone
- Sentry
- GA4
- Microsoft Clarity

## Development behavior

Before coding:

1. Read all files in `docs/` and `codex-prompts/`.
2. Produce a short implementation plan.
3. Ask no broad strategy questions. Make reasonable implementation decisions.
4. Do not invent external product requirements that conflict with the docs.

During coding:

1. Keep code type-safe.
2. Prefer simple, composable functions over clever abstractions.
3. Keep the MVP small but complete.
4. Add migrations/schema before features that depend on them.
5. Add validation to every API input.
6. Add role checks to protected actions.
7. Add audit logs for review publication, hiding, disputes, business replies, and takedown requests.
8. Never expose private evidence asset URLs publicly without signed URL logic.
9. Never store raw IP addresses; store a hash.
10. Never show full emails publicly.

After coding:

1. Run typecheck.
2. Run lint if configured.
3. Run tests if configured.
4. If tests cannot run because dependencies/environment variables are missing, state exactly what is missing.
5. Return changed files and a concise summary.

## Product rules

### Complaint-only rule

Positive reviews are not allowed.

A submitted review must contain at least one problem category and problem-focused body text. Praise-only or mostly positive content must be blocked with a rewrite prompt:

> Xreviews는 좋은 점을 받지 않습니다. 다른 사람이 피해야 할 문제만 적어주세요.

### Categories for MVP

MVP categories:

1. Medical clinics (`medical_clinic`)
   - Dermatology
   - Korean medicine clinic
   - Cosmetic/surgery/aesthetic clinic
2. Real estate agencies (`real_estate`)
3. Auto repair shops (`auto_repair`)

Do not build person reviews in MVP.

### Medical review guardrails

For medical categories, focus on:

- Consultation process
- Pricing explanation
- Refund/contract issues
- Waiting time
- Hygiene/facility
- Ad mismatch
- Pressure sales

Avoid building UI copy that asks users to judge medical diagnosis, medical causation, or treatment effectiveness as a definitive fact.

### Business official account

Businesses can claim an official account.

Features:

- Official badge
- Reply to reviews
- Improvement posts
- Submit evidence/correction materials
- Basic subscription plan placeholder: KRW 4,900/month

Do not implement pay-to-delete. Paid businesses must never be able to delete consumer reviews by payment.

## Security and safety baseline

- Validate inputs with Zod or equivalent.
- Use least privilege queries.
- Protect admin routes.
- Protect business routes.
- Store evidence assets in private R2 buckets.
- Use signed upload/read flows.
- Add audit logs for all sensitive state changes.
- Add rate limits or placeholders where Cloudflare rate limiting will be applied.
- Add Turnstile placeholders to signup/review submission.

## UI tone

Sharp, minimal, black/white/gray-first.

Approved copy:

- 혹시 리뷰 볼 때, 1점부터 보시나요?
- 좋은 후기는 이미 충분합니다.
- Xreviews는 사람들이 먼저 찾는 나쁜 후기만 모읍니다.
- 좋은 곳 말고, 피해야 할 곳부터.
- Xreviews는 긍정 리뷰를 받지 않습니다.
- 좋았던 점은 쓰지 마세요. 문제만 쓰세요.
- 불만이 쌓이고 있습니다. 공식 입장을 등록하세요.

Important UI rule:

- “1점부터 본다” describes behavior on existing review platforms. Xreviews itself must not have star ratings or star-selection UI.

Forbidden tone:

- Meme-only UI
- Harassment
- Personal doxxing
- Slurs
- Claims of criminality as fact without process
