# Xreviews Closed Beta Plan

> Draft for closed beta operations. This document is a product/legal-ops working draft and does not replace advice from a licensed attorney.

## 1. Objective

Closed beta should prove whether users understand and trust a complaint-only review platform, while confirming that moderation, evidence, business reply, and audit workflows can handle real operational risk.

## 2. Beta scope

Initial categories:

- hospital/clinic (`medical_clinic`)
- real estate (`real_estate`)
- auto repair (`auto_repair`)

No person reviews.

No public launch.

No payment.

No AI summary, Qdrant, map, notification, data API, or consumer premium features.

## 3. Recommended participant count

Start small:

- Wave 1: 20-30 trusted testers
- Wave 2: 50-100 testers after first moderation review
- Wave 3: up to 200 testers only if incident load remains manageable

Include:

- ordinary consumers
- a few business operators willing to test official reply flows
- internal moderators
- legal/ops reviewers

## 4. Invite method

Use invite-only access.

Recommended channels:

- direct email invite
- private community invite
- founder network
- small local operator group

Keep a list of invited emails and tester roles.

## 5. Regional limit

Begin with one or two regions to reduce moderation complexity.

Recommended:

- Seoul/Gyeonggi subset
- one known commercial district
- one clinic-heavy area if medical guardrails are ready

Do not open nationally until moderation load is understood.

## 6. Tester instructions

Ask testers to try:

- search before visiting
- subject creation
- complaint submission
- evidence upload
- positive-review block
- medical guardrail
- ranking pages
- business official response view

Do not ask testers to fabricate complaints. Use real experiences or clearly labeled internal test subjects.

## 7. Feedback collection

Collect:

- confusion points
- blocked-review quality
- moderation turnaround time
- evidence upload friction
- trust in official badge wording
- whether ranking feels like risk signal, not star rating
- whether medical wording feels safe
- business reply fairness

Use the closed beta feedback address listed in `CONTACT_CHANNELS.md`.

Before launch, replace all placeholder contacts in `CONTACT_CHANNELS.md` with real monitored inboxes.

## 8. Risk monitoring

Daily during first week:

- new pending complaints
- positive-review block events
- medical guardrail blocks
- evidence upload failures
- admin moderation queue size
- disputed/hidden/removed counts
- business claim submissions
- legal/privacy reports
- public page evidence leak scan
- ranking subjects with newly published complaints
- business claim queue count
- R2 upload failure rate
- Sentry error volume if enabled
- GA4/Clarity script status if enabled

## 9. Success metrics

Closed beta is working if:

- users understand that Xreviews does not accept positive reviews
- valid complaint submission succeeds
- praise-only submissions are blocked
- pending reviews stay non-public
- evidence remains private
- moderators can approve/hide/dispute/remove without hard delete
- businesses understand they have reply rights, not deletion rights
- ranking reflects published complaints only
- no critical privacy/security incident occurs

## 10. Stop or pause criteria

Pause beta if:

- evidence files become publicly accessible
- private data appears publicly
- admin account compromise is suspected
- legal notices exceed review capacity
- moderation queue becomes unmanageable
- business harassment or user harassment emerges
- medical claims are repeatedly unsafe

## 11. Beta exit criteria

Move toward broader launch only after:

- legal counsel reviews terms/privacy/policies
- moderation playbook is tested
- incident response workflow is tested
- evidence privacy verified
- admin and business permissions regression-tested
- production secrets are rotated and hardened
- public copy is reviewed for medical/legal risk

## 12. Closed beta operator checklist

Before invites:

- [ ] Start with 20-30 invited testers
- [ ] Limit the first region or commercial area
- [ ] Confirm initial categories: hospital/clinic, real estate, auto repair
- [ ] Replace contact placeholders with real inboxes
- [ ] Confirm feedback channel owner
- [ ] Confirm rights infringement/legal channel owner
- [ ] Confirm privacy request owner
- [ ] Confirm business inquiry owner
- [ ] Confirm emergency pause owner
- [ ] Confirm admin account holder and backup
- [ ] Complete staging smoke test checklist

Daily operating metrics:

- [ ] New signups
- [ ] Search events
- [ ] Subject creations
- [ ] Pending complaints
- [ ] Positive-review blocks
- [ ] Medical guardrail blocks
- [ ] Evidence uploads and failures
- [ ] Admin queue size
- [ ] Published/hidden/disputed/removed counts
- [ ] Business claim submissions
- [ ] Business responses and improvement posts
- [ ] Ranking recalculation status
- [ ] Privacy/legal/security reports

Emergency stop criteria:

- evidence object key or URL appears publicly
- private personal data appears publicly
- pending/non-public reviews appear publicly
- admin moderation is unavailable
- admin account compromise is suspected
- legal notices exceed review capacity
- R2/Neon/Cloudflare incident blocks safe operation
