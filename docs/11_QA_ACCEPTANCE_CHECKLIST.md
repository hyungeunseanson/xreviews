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
- [ ] Praise-only review is rejected.
- [ ] Valid complaint review is submitted as pending.
- [ ] Pending review is not visible publicly.
- [ ] Admin can approve review.
- [ ] Published review appears on subject page.

## Evidence tests

- [ ] User can request upload URL.
- [ ] Evidence metadata is saved.
- [ ] Public page shows evidence level but not private file URL.
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

## Ranking tests

- [ ] Ranking page loads.
- [ ] Published reviews affect risk score.
- [ ] Hidden/removed reviews do not count.
- [ ] Evidence level affects risk score.

## Security tests

- [ ] Non-admin cannot access admin pages.
- [ ] Non-business cannot access business dashboard for another subject.
- [ ] User cannot approve own review.
- [ ] API rejects invalid category/tag combinations.
- [ ] Private R2 object keys are not leaked.
