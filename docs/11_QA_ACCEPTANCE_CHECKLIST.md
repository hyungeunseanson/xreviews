# 11 — QA and Acceptance Checklist

## Smoke tests

- [ ] Home page loads.
- [ ] Search page loads.
- [ ] Category pages load.
- [ ] Sign up works.
- [ ] Sign in works.
- [ ] Sign out works.
- [ ] Authenticated routes redirect unauthenticated users.

## Subject tests

- [ ] User can create medical_clinic subject.
- [ ] User can create real estate subject.
- [ ] User can create auto repair subject.
- [ ] Search finds created subject.
- [ ] Public subject page renders.

## Complaint review tests

- [ ] User can start review for subject.
- [ ] User must select at least one risk tag.
- [ ] User must confirm author liability.
- [ ] Body shorter than minimum is rejected.
- [ ] Praise-only review is rejected by the positive review block.
- [ ] Medical guardrail blocks diagnosis/treatment/causation claims.
- [ ] Valid complaint review is submitted as pending.
- [ ] Pending review is not visible publicly.
- [ ] Admin can approve review.
- [ ] Published review appears on subject page.
- [ ] Hidden/disputed/removed reviews are not visible publicly.

## Evidence tests

- [ ] User can request upload URL.
- [ ] Evidence metadata is saved.
- [ ] Public page shows evidence level but not private file URL.
- [ ] Public page does not expose R2 object key, upload URL, signed URL, or public evidence URL.
- [ ] Admin can view signed evidence link.

## Moderation tests

- [ ] Admin can view moderation queue.
- [ ] Admin can approve.
- [ ] Admin can hide.
- [ ] Admin can dispute.
- [ ] Admin can remove.
- [ ] Every action writes audit log.

## Business tests

- [ ] User can submit business claim.
- [ ] Admin can approve business claim.
- [ ] Approved business gets official profile.
- [ ] Business can reply to a review.
- [ ] Business can create improvement post.
- [ ] Business cannot delete review.
- [ ] Business cannot hide, dispute, remove, or otherwise change review status.

## Ranking tests

- [ ] Ranking page loads.
- [ ] Published reviews affect risk score.
- [ ] Pending/hidden/disputed/removed reviews do not count.
- [ ] Evidence level affects risk score.
- [ ] X-risk score does not look like a star rating or average rating.

## Observability tests

- [ ] `SENTRY_DSN` missing leaves Sentry disabled without breaking local dev/build.
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` missing prevents GA4 script insertion.
- [ ] `NEXT_PUBLIC_CLARITY_PROJECT_ID` missing prevents Clarity script insertion.
- [ ] Analytics helper accepts only allowlisted payload keys.
- [ ] Analytics events never include raw review body.
- [ ] Analytics events never include evidence object key, upload URL, signed URL, or public evidence URL.
- [ ] Analytics events never include raw email or raw phone.
- [ ] Search analytics stores query presence/result count, not raw sensitive text.

## Security tests

- [ ] Non-admin cannot access admin pages.
- [ ] Non-business cannot access business dashboard for another subject.
- [ ] User cannot approve own review.
- [ ] API rejects invalid category/tag combinations.
- [ ] Private R2 object keys are not leaked.
- [ ] `.env.local` is ignored by git.
- [ ] Supabase dependency/config/import is absent.
- [ ] Vercel dependency/config/import is absent, except optional peer metadata in lockfile.
- [ ] Pinecone dependency/config/import is absent.
- [ ] Stripe/Toss, Qdrant, AI summary, maps, notifications, data API, and consumer premium features are absent until their phases.
