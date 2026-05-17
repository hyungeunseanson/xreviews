# 13 — Code Review Rubric

Use this to review Codex output.

## Product correctness

- [ ] Positive reviews are actually blocked, not just hidden by UI.
- [ ] Risk tags are required.
- [ ] Reviews enter pending state.
- [ ] Published pages only show published reviews.
- [ ] Business can reply but cannot delete reviews.
- [ ] Official badge only appears after approved claim.
- [ ] Medical category copy avoids definitive diagnosis/treatment causation prompts.

## Architecture correctness

- [ ] No Vercel-specific deployment dependency.
- [ ] No Supabase imports or env variables.
- [ ] No Pinecone imports or env variables.
- [ ] Neon + Drizzle are used.
- [ ] BetterAuth is used for auth.
- [ ] R2 is used or clearly stubbed for evidence.
- [ ] Sentry/GA4/Clarity are optional by env.

## Security correctness

- [ ] Admin API checks admin role server-side.
- [ ] Business API checks ownership server-side.
- [ ] Evidence URLs are private/signed.
- [ ] Inputs are validated.
- [ ] Sensitive actions write audit logs.
- [ ] Raw IP is not stored.
- [ ] No private evidence object keys are exposed publicly.

## UX correctness

- [ ] Home hero starts from the “1점부터/나쁜 후기부터 먼저 보는 습관” insight.
- [ ] “1점부터 본다” appears only as behavior copy, never as star-rating UI.
- [ ] Review form clearly says praise is not accepted.
- [ ] Positive review block message is clear.
- [ ] Subject page exposes risk score, tags, reviews, business area.
- [ ] Admin UI is usable enough for beta.

## Maintainability

- [ ] Code is typed.
- [ ] DB schema names are consistent.
- [ ] No giant unreadable components.
- [ ] Business logic is not scattered randomly across UI.
- [ ] Tests exist for high-risk logic where feasible.
