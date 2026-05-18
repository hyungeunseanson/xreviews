# Xreviews Environment Checklist

> Phase 12 deployment readiness document. Do not commit real secret values. Track presence and owner only.

## 1. Environments

Use three explicit environments:

- `local`: developer machine using `.env.local`
- `staging`: closed beta, production-like Cloudflare deployment
- `production`: public launch candidate

Staging should be as close to production as possible, but with separate Neon database, R2 bucket, Resend sender/domain, and analytics properties where practical.

## 2. Required variables

| Variable | Local | Staging | Production | Notes |
|---|---:|---:|---:|---|
| `DATABASE_URL` | required for DB flows | required secret | required secret | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | required for auth | required secret | required secret | At least 32 chars, random |
| `BETTER_AUTH_URL` | required for auth | required secret or protected var | required secret or protected var | Must match deployed app URL |
| `NEXT_PUBLIC_APP_URL` | required public var | required public var | required public var | Public base URL |
| `RESEND_API_KEY` | optional mock if blank | required secret | required secret | Staging can use sandbox/test domain |
| `RESEND_FROM_EMAIL` | required if sending | required secret or protected var | required secret or protected var | Must be verified before launch |
| `R2_ACCOUNT_ID` | required for upload | required secret | required secret | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | required for upload | required secret | required secret | Least privilege R2 API token |
| `R2_SECRET_ACCESS_KEY` | required for upload | required secret | required secret | Never print or commit |
| `R2_BUCKET_NAME` | required for upload | required secret or protected var | required secret or protected var | Use private bucket only |
| `SENTRY_DSN` | optional | optional but recommended | recommended | Empty means disabled |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | optional | recommended | Public analytics ID |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | optional | optional | recommended | Public analytics ID |

## 3. Local status on Phase 12 check

Values were not printed. Presence only:

| Variable | Local presence |
|---|---|
| `DATABASE_URL` | present |
| `BETTER_AUTH_SECRET` | present |
| `BETTER_AUTH_URL` | present |
| `NEXT_PUBLIC_APP_URL` | present |
| `RESEND_API_KEY` | missing or blank |
| `RESEND_FROM_EMAIL` | present |
| `R2_ACCOUNT_ID` | present |
| `R2_ACCESS_KEY_ID` | present |
| `R2_SECRET_ACCESS_KEY` | present |
| `R2_BUCKET_NAME` | present |
| `SENTRY_DSN` | missing or blank |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | missing or blank |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | missing or blank |

Local blanks are acceptable for Resend mock mode and disabled observability/analytics placeholders. Staging should set Resend and should intentionally decide whether Sentry/GA4/Clarity are enabled.

## 4. Staging checklist

- [ ] Separate Neon database created
- [ ] Drizzle migrations applied
- [ ] Seed data applied
- [ ] Private R2 bucket created
- [ ] R2 bucket has no public evidence URL policy
- [ ] R2 least-privilege API token created
- [ ] BetterAuth URL points to staging URL
- [ ] BetterAuth secret is long and random
- [ ] Resend sender is verified or explicitly sandboxed
- [ ] Sentry DSN set or intentionally blank
- [ ] GA4 property set or intentionally blank
- [ ] Clarity project set or intentionally blank
- [ ] `.env.local` is not tracked
- [ ] Staging secrets registered through Wrangler/Cloudflare dashboard
- [ ] Cloudflare build runs without `.env.local` present in the repo
- [ ] Build-time public env values are provided separately from runtime secrets

## 5. Production checklist

- [ ] Separate production Neon database created
- [ ] Production R2 private bucket created
- [ ] Production Resend domain verified
- [ ] Production app URL configured
- [ ] Production BetterAuth secret rotated
- [ ] Sentry DSN configured with PII scrubbing expectations
- [ ] GA4/Clarity configured only after privacy review
- [ ] Admin account created and protected
- [ ] Legal/ops contacts replaced with real monitored inboxes
- [ ] Closed beta findings reviewed before public launch
