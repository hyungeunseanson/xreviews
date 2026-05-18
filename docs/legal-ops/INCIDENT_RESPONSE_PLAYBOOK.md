# Xreviews Incident Response Playbook

> Draft for closed beta operations. This document is a product/legal-ops working draft and does not replace advice from a licensed attorney.

## 1. Incident principle

When safety, privacy, legal exposure, or evidence confidentiality is at risk, pause growth and protect users first.

Xreviews can be sharp only if the operating system is calm, logged, and decisive.

## 2. Severity levels

### Sev 1

Immediate critical risk:

- evidence file publicly exposed
- admin account compromise
- private user data exposed
- legal deadline received
- production database access compromised
- platform-wide publication bug

### Sev 2

High risk:

- false review report wave
- specific business legal threat
- medical claim risk spreading publicly
- moderation queue overload
- R2/Neon/Cloudflare partial outage

### Sev 3

Manageable issue:

- single disputed review
- isolated policy violation
- minor analytics issue
- non-public evidence upload failure

## 3. General response steps

1. Identify incident type.
2. Assign incident owner.
3. Preserve logs.
4. Stop further exposure if needed.
5. Move risky content to `hidden` or `disputed` if appropriate.
6. Notify relevant internal stakeholders.
7. Communicate externally only with approved wording.
8. Document timeline.
9. Patch process or product gap.
10. Write post-incident review.

## 4. False review report surge

Actions:

- freeze publication for affected subject if needed
- review author history and evidence
- check duplicate language and timing
- keep questionable reviews pending/hidden
- allow business official response if approved
- log all moderation decisions

Do not grant deletion rights to the business.

## 5. Specific business complaint or legal threat

Actions:

- acknowledge receipt without admitting fault
- open legal/moderation case
- preserve review, evidence, and audit logs
- review exact challenged statements
- hide temporarily if privacy/legal risk is credible
- request author clarification/evidence if needed
- offer business right of reply
- escalate to counsel before public response

## 6. Legal notice

Actions:

- record received date/time
- identify deadline
- store notice securely
- notify incident owner
- freeze risky content if needed
- consult legal counsel
- respond only through approved channel

Use the legal notice and security addresses listed in `CONTACT_CHANNELS.md`. Replace placeholders with real monitored inboxes before closed beta launch.

## 7. Personal information exposure

Actions:

- immediately hide affected content
- identify exposed data type
- remove or redact personal data
- check caches/screenshots/public pages
- notify affected person if legally required
- audit how it passed moderation
- update checklist or detector rules

## 8. Evidence file exposure suspicion

Actions:

- disable related signed URL flow if necessary
- rotate R2 credentials if compromise suspected
- verify bucket public access settings
- search public pages for object keys or URLs
- audit evidence access logs
- move affected reviews hidden while investigating
- document exact exposure window

Evidence object keys and URLs must never be posted in incident channels unless access is restricted.

## 9. Admin account compromise

Actions:

- revoke session
- rotate credentials/secrets where relevant
- disable affected admin account
- inspect audit logs for moderation changes
- revert unsafe status changes through status updates, not hard delete
- review evidence access logs
- require fresh admin authentication

## 10. Cloudflare/R2/Neon outage

Actions:

- identify provider and blast radius
- pause actions that depend on affected provider
- disable evidence upload if R2 is unavailable
- keep review submission from publishing directly
- communicate beta degradation if needed
- retry only when provider status stabilizes

## 11. Temporary service pause criteria

Pause closed beta if:

- evidence privacy is uncertain
- admin moderation is unavailable
- database writes are unreliable
- published/non-public status boundary is broken
- legal deadline cannot be assessed
- harassment or doxxing risk is active

## 12. Post-incident review

Record:

- incident summary
- severity
- start/end time
- affected users/subjects
- root cause
- actions taken
- audit log references
- policy updates needed
- product fixes needed
- owner and deadline
