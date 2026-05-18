# Xreviews Privacy Policy Draft

> Draft for closed beta operations. This document is a product/legal-ops working draft and does not replace advice from a licensed attorney.

## 1. Privacy position

Xreviews handles negative consumer experiences, evidence files, moderation actions, and business disputes. Privacy is a core safety requirement, not a secondary compliance task.

Xreviews collects the minimum data needed to operate authentication, complaint submission, evidence review, moderation, business response, analytics, and incident response.

## 2. Information collected

Closed beta may collect:

- account email
- authentication session information
- optional display name
- user role
- subject creation data
- complaint title, issue summary, body, risk tags, category, and status
- author responsibility confirmation
- evidence metadata
- private evidence files
- business claim information
- official business responses and improvement posts
- moderation notes and audit logs
- search/ranking/product analytics events
- hashed IP or other abuse-prevention signals where configured
- user agent where operationally necessary

## 3. Login and email

Xreviews uses email-based authentication.

Email addresses are used for:

- login and session operations
- account identification
- beta support
- abuse prevention
- legal or operational notices where required

Public pages must not expose full user emails.

## 4. Review data

Complaint content may be public only after administrator approval.

Only `published` complaints are shown publicly. `pending`, `hidden`, `disputed`, and `removed` complaints are not shown on public subject pages.

Review body text is not sent to analytics payloads.

## 5. Evidence files

Evidence files are private-by-default.

Xreviews stores evidence files in Cloudflare R2 and stores metadata in the database.

Evidence metadata may include:

- file name
- file type
- file size
- evidence type
- uploaded user ID
- linked review ID
- private R2 object key

Public pages must not expose:

- R2 object key
- upload URL
- signed read URL
- public evidence URL
- evidence gallery

Evidence access is limited to the author, authorized administrators, and future verified related business flows only after explicit permission checks.

## 6. Analytics and observability

Xreviews may use:

- Sentry for error tracking
- GA4 for traffic/product analytics
- Microsoft Clarity for UX learning
- internal audit logs for sensitive actions
- internal sanitized analytics events

Analytics events must not include:

- raw review body
- raw evidence object key
- upload URL
- signed URL
- public evidence URL
- raw email
- raw phone number
- passwords or tokens

Allowed analytics payloads should use IDs, category, status, counts, and coarse ranges where possible.

## 7. Sensitive information minimization

Users must not submit unnecessary personal information about themselves, staff, reviewers, patients, tenants, customers, or third parties.

Xreviews may hide, dispute, or remove content that exposes:

- private phone numbers
- private emails
- national ID numbers
- detailed home addresses
- patient identifiers
- financial account details
- private messages unrelated to the consumer issue

## 8. Storage and retention

Closed beta retention is operational and subject to change.

General approach:

- account/session data is retained while the account exists
- published complaint content is retained while it remains relevant and policy-compliant
- pending/hidden/disputed/removed content may be retained for audit, dispute, legal, and abuse-prevention purposes
- evidence files may be retained while the related complaint, dispute, or legal issue remains active
- audit logs may be retained longer for platform accountability

Retention periods should be reviewed with legal counsel before public launch.

## 9. User requests

Users may request:

- account support
- correction of account information
- review status inquiry
- evidence removal review
- privacy concern review
- data access/deletion request where legally applicable

Use the privacy request address listed in `CONTACT_CHANNELS.md`. Replace the placeholder with a real monitored inbox before closed beta launch.

## 10. Security baseline

Xreviews uses:

- role-based access checks
- private R2 storage
- signed upload/read flows
- admin-only evidence review
- audit logs for sensitive actions
- environment-based secrets
- no committed real secrets

## 11. Third-party processors

Expected service providers:

- Neon Postgres
- Cloudflare Workers/Pages
- Cloudflare R2
- BetterAuth stack
- Resend
- Sentry
- GA4
- Microsoft Clarity

Provider list and data processing terms must be reviewed before public launch.

## 12. Policy changes

This draft may change during closed beta as Xreviews learns from abuse patterns, legal requests, and operational incidents.
