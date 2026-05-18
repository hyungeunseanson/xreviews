# Xreviews Staging Smoke Test Checklist

> Phase 12 production-like staging checklist. Use real accounts and test subjects only. Do not publish fabricated complaints about real businesses.

## 1. Pre-flight

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `pnpm cf:build` passes
- [ ] `git diff --check` passes
- [ ] Staging env/secrets are present
- [ ] Neon migrations applied
- [ ] Seed data loaded
- [ ] Private R2 bucket configured
- [ ] Admin test email selected

## 2. Public app

- [ ] Home page loads
- [ ] Home copy starts from "혹시 리뷰 볼 때, 1점부터 보시나요?"
- [ ] No star rating UI is visible
- [ ] Search entry point works
- [ ] Ranking entry point works
- [ ] Analytics scripts load only when env IDs exist
- [ ] Sentry status is intentionally enabled or disabled

## 3. Auth

- [ ] Login page loads
- [ ] Magic link request succeeds
- [ ] Resend sends email or staging mock/log behavior is understood
- [ ] Authenticated user can access `/account`
- [ ] User role defaults to `user`
- [ ] No role self-assignment UI exists

## 4. Subject flow

- [ ] Logged-in user can create subject
- [ ] Subject category is limited to `medical_clinic`, `real_estate`, `auto_repair`
- [ ] Person/individual subject creation is blocked
- [ ] Subject search returns created subject
- [ ] Subject detail page loads

## 5. Complaint flow

- [ ] Logged-out user cannot access complaint form
- [ ] Logged-in user can open complaint form
- [ ] Required title, issue summary, body, risk tag, severity, and liability confirmation are enforced
- [ ] Positive-only complaint is blocked
- [ ] Medical guardrail blocks or rewrites unsafe medical claims
- [ ] Valid complaint saves as `pending`
- [ ] Pending complaint is not visible on public subject page

## 6. Evidence flow

- [ ] Allowed file type upload gets presigned PUT URL
- [ ] R2 object is created
- [ ] Evidence metadata is saved
- [ ] Evidence attaches to review after submission
- [ ] Evidence level updates
- [ ] Public subject page does not expose R2 object key
- [ ] Public subject page does not expose upload URL
- [ ] Public subject page does not expose signed read URL
- [ ] Public subject page does not expose public evidence URL

## 7. Admin moderation

- [ ] Create/login admin account
- [ ] Run `pnpm admin:promote --email=admin@example.com`
- [ ] Admin can access `/admin/reviews`
- [ ] Normal user cannot access `/admin`
- [ ] Admin can approve pending complaint
- [ ] Approved complaint becomes `published`
- [ ] Published complaint appears publicly
- [ ] Hide/dispute/remove makes complaint non-public
- [ ] Hard delete does not occur
- [ ] Audit log is written for moderation action

## 8. Business flow

- [ ] User can submit business claim
- [ ] Claim is `pending`
- [ ] Admin can approve claim
- [ ] Business profile is created/activated
- [ ] Official badge appears for approved subject
- [ ] Business can manage only own approved subject
- [ ] Business cannot delete review
- [ ] Business cannot hide/dispute/remove review
- [ ] Business can write official response to published review
- [ ] Business can create improvement post

## 9. Risk and ranking

- [ ] Run `pnpm risk:recalculate`
- [ ] `/rankings` loads
- [ ] Category ranking pages load
- [ ] Published complaint appears in ranking
- [ ] Pending/hidden/disputed/removed complaints do not affect ranking
- [ ] X-risk score does not look like star rating

## 10. Observability and analytics

- [ ] `search_performed` can be recorded without raw query body
- [ ] `review_submitted` contains IDs/counts only
- [ ] `positive_review_blocked` records no raw body
- [ ] `evidence_uploaded` records no object key or URL
- [ ] `ranking_viewed` works
- [ ] Sentry error capture does not include raw review body, raw email, phone, or evidence URL

## 11. Final public safety scan

- [ ] Positive review block still active
- [ ] No star rating UI/field exposed
- [ ] Published-only public visibility verified
- [ ] Evidence private-by-default verified
- [ ] No public evidence URL
- [ ] Business has no deletion/status-change right
- [ ] Admin-only moderation verified
- [ ] Forbidden stacks absent

