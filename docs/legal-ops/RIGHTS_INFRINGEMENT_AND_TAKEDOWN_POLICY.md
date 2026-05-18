# Rights Infringement and Takedown Policy

> Draft for closed beta operations. This document is a product/legal-ops working draft and does not replace advice from a licensed attorney.

## 1. Purpose

This policy defines how Xreviews handles rights infringement reports, legal complaints, privacy complaints, and takedown requests.

Xreviews does not treat business pressure as automatic deletion. Xreviews reviews facts, evidence, policy risk, user responsibility, business reply rights, and audit logs.

## 2. Report intake

A report should capture:

- reporter name or organization
- contact email
- relationship to subject or content
- content URL or review ID
- reason for request
- specific allegedly false, private, or unlawful statements
- supporting documents if available
- requested action

Use the legal notice address listed in `CONTACT_CHANNELS.md`. Replace the placeholder with a real monitored inbox before closed beta launch.

## 3. Initial triage

Operators should classify:

- privacy exposure
- defamation/legal risk
- medical-risk claim
- business dispute
- evidence dispute
- impersonation
- spam/abuse
- urgent safety issue

## 4. Temporary non-public action

Xreviews may temporarily hide content when there is credible risk of:

- personal data exposure
- serious legal harm
- medical misinformation
- targeted harassment
- evidence leak
- clear policy violation

Temporary non-public handling is not an admission that the complaint is false.

## 5. Author response

Where appropriate, Xreviews may ask the author to:

- clarify wording
- remove personal data
- provide evidence
- rewrite definitive legal/medical claims into experience-based language
- confirm the experience basis

If the author does not respond, Xreviews may keep the review hidden, disputed, or removed.

## 6. Business right of reply

Businesses may:

- submit an official response
- provide correction materials
- request dispute review
- publish improvement posts after approval

Businesses may not:

- delete reviews
- force reviewer identity disclosure
- access private evidence without explicit permission checks
- use legal threats as a moderation shortcut

## 7. Admin decision

Possible decisions:

- keep pending
- publish
- mark disputed
- hide
- move to removed
- request evidence
- request rewrite
- reject the takedown request

Every sensitive decision should be recorded in `audit_logs`.

## 8. Status definitions

- `pending`: submitted but not public
- `published`: public after admin approval
- `disputed`: subject to dispute, right-of-reply, or legal review
- `hidden`: not public due to temporary or operational risk
- `removed`: no longer public due to policy, legal, or safety reason

`removed` is a status. It should not be described as business-owned deletion.

## 9. Audit log expectations

Log:

- actor user ID
- actor role
- action
- target type
- target ID
- previous status
- next status
- moderation case ID
- legal request ID where available
- reason
- admin note presence
- timestamp

Do not log raw secrets, private evidence URLs, or unnecessary personal data.

## 10. Escalation

Escalate to incident response when:

- personal data is public
- evidence file exposure is suspected
- legal notice is received
- press/social amplification begins
- moderator account compromise is suspected
- Cloudflare/R2/Neon outage affects safety operations
