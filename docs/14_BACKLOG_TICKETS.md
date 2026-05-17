# 14 — Backlog Tickets

Note: `P0` in this file means product priority, not implementation Phase 0. Phase 0 is limited to repo scaffold and Cloudflare-ready app setup.

## P0 — Must ship

### P0-01 Repo setup

Acceptance:
- Next.js app runs locally.
- Tailwind works.
- Cloudflare/OpenNext config exists.

### P0-02 DB schema

Acceptance:
- Drizzle schema exists.
- Migrations can be generated.
- Risk tags can be seeded.

### P0-03 Auth

Acceptance:
- User can sign up/sign in/sign out.
- Session-aware nav works.
- Admin guard works.

### P0-04 Subjects/search

Acceptance:
- Create subject.
- Search subjects.
- Public subject page.

### P0-05 Complaint-only review

Acceptance:
- User can submit complaint review.
- Positive-only review blocked.
- Review is pending.
- Admin can publish.

### P0-06 Evidence

Acceptance:
- R2 upload flow or well-defined signed URL stub.
- Evidence metadata saved.
- Public page does not leak private URL.

### P0-07 Admin moderation

Acceptance:
- Pending queue.
- Approve/hide/dispute/remove.
- Audit logs.

### P0-08 Business official account

Acceptance:
- Claim request.
- Admin approval.
- Official badge.
- Business reply.
- Improvement post.

### P0-09 Rankings

Acceptance:
- Risk score calculated.
- Ranking module/page works.

## P1 — Strong beta

- Turnstile verification
- Rate limiting
- Sentry scrubbing
- Clarity masking review form fields
- Email notifications
- Better duplicate subject detection
- Legal request form
- Advanced medical content flags

## P2 — Data company layer

- Qdrant complaint clustering
- Similar complaint pattern detection
- Business analytics dashboard
- Multi-location accounts
- Data/API product
- Investor/brand risk reports
