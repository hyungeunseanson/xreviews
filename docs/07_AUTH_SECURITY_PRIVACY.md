# 07 — Auth, Security, and Privacy

## Auth stack

Use BetterAuth with Neon Postgres and Drizzle-compatible schema.

Auth methods for MVP:

1. Email/password or email magic link depending on BetterAuth implementation fit
2. OAuth can be added later

## Roles

| Role | Access |
|---|---|
| user | Search, create subjects, write reviews, upload evidence |
| business | User permissions + official business dashboard for approved claims |
| admin | Moderation, claims, legal requests, audit views |

## Session requirements

- Secure cookies in production
- HTTP-only cookies
- CSRF protection if required by BetterAuth route pattern
- Server-side role checks

## Private data handling

Never expose:

- User email
- Raw IP
- Raw user agent
- Private evidence URLs
- Business registration documents
- Admin notes

## IP/user-agent hashing

Use server-side secret salt.

```text
ip_hash = sha256(IP_HASH_SALT + ip)
user_agent_hash = sha256(IP_HASH_SALT + userAgent)
```

## Evidence privacy

Evidence files are private by default.

Public UI can show:

- “증거 있음”
- evidence type
- evidence level

Admin UI can access signed read URL.

## Turnstile

Add placeholders for Cloudflare Turnstile verification to:

- signup
- review submission
- business claim
- legal request

## Rate limiting targets

MVP placeholders:

| Action | Limit idea |
|---|---|
| Signup | by IP hash |
| Review creation | by user and subject |
| Evidence upload URL | by user |
| Business claim | by user and subject |
| Legal request | by requester email/IP hash |

## Sentry

Sentry should be configured but must not capture:

- full review body if flagged private
- evidence URLs
- passwords/tokens
- raw IPs

Add Sentry scrubbing config where possible.
