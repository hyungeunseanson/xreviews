# 10 — Deployment Runbook

## Objective

Deploy Xreviews on Cloudflare Workers/Pages with Neon Postgres, Cloudflare R2, BetterAuth, Resend, and optional Sentry/GA4/Clarity placeholders.

Do not deploy Xreviews on Vercel. Do not configure Supabase or Pinecone.

## Local setup

```bash
corepack prepare pnpm@10.33.4 --activate
pnpm install
cp .env.example .env.local
pnpm dev
```

The web app runs at `http://localhost:3000` by default.

Local dev can run without Sentry, GA4, Clarity, or Resend keys. Database-backed flows need `DATABASE_URL`.

## Neon Postgres

1. Create a Neon project.
2. Create the initial Postgres database.
3. Copy the pooled or direct connection string.
4. Set local `DATABASE_URL`:

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
```

Run migrations and seed data:

```bash
pnpm db:migrate
pnpm db:seed
```

Use `pnpm db:push` only for explicit development sync work. Prefer migrations for production.

## Cloudflare R2

Create a private R2 bucket, for example:

```text
xreviews-evidence-prod
```

Create R2 API credentials with least privilege for this bucket. Configure:

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=xreviews-evidence-prod
```

Evidence files are private-by-default. Do not configure a public bucket URL for app evidence access.

## Cloudflare Workers/Pages

Use the OpenNext Cloudflare adapter:

```bash
pnpm cf:build
```

Preview/dry-run options:

```bash
pnpm --filter @xreviews/web preview
cd apps/web
wrangler deploy --dry-run
```

Wrangler 4.x may require Node.js 22 or newer for deploy/dry-run commands. If local development uses Node 20, `pnpm cf:build` can still verify the OpenNext bundle, but the final Wrangler dry-run/deploy should be executed in a Node 22+ shell or CI runner.

Deploy with the app-level Wrangler config:

```bash
cd apps/web
wrangler deploy
```

The reference config is in `templates/wrangler.example.toml`; the active app config is `apps/web/wrangler.toml`.

## Cloudflare env and secrets

Set non-secret public variables through Cloudflare dashboard or Wrangler vars:

```text
APP_NAME=Xreviews
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
BETTER_AUTH_URL=https://your-domain.example
RESEND_FROM_EMAIL="Xreviews <no-reply@your-domain.example>"
R2_ACCOUNT_ID=
R2_BUCKET_NAME=xreviews-evidence-prod
```

Set sensitive secrets with Wrangler:

```bash
cd apps/web
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put SENTRY_DSN
wrangler secret put IP_HASH_SALT
```

For public env values, prefer Cloudflare dashboard vars or config-managed vars. Use `wrangler secret put` only for sensitive values or if the deployment process intentionally treats a value as protected. Never paste actual secret values into docs, commits, issues, or chat.

Never commit `.env.local` or real secrets.

When building for Cloudflare, do not run `opennextjs-cloudflare build` with a
real `.env.local` file in place. Next/OpenNext can read local env files during
the production build, which may copy local secret values into generated build
artifacts. Before a staging/production build, move `.env.local` outside the repo
or build in a clean CI environment, then provide only build-time public values:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.example \
NEXT_PUBLIC_GA_MEASUREMENT_ID= \
NEXT_PUBLIC_CLARITY_PROJECT_ID= \
pnpm cf:build
```

Server-side secret values must come from Cloudflare secrets or protected runtime
variables, not from `.env.local` baked into the bundle.

## Environment matrix

Use the full checklist in `docs/beta/ENVIRONMENT_CHECKLIST.md`.

Minimum required variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `SENTRY_DSN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`

Separate local, staging, and production values. Staging should use a production-like Cloudflare deployment with separate Neon/R2 resources.

## Resend

Create a Resend account and sender/domain. Configure:

```text
RESEND_API_KEY=
RESEND_FROM_EMAIL="Xreviews <no-reply@your-domain.example>"
```

In development, missing `RESEND_API_KEY` falls back to mock/log behavior.

## Sentry

Create a Sentry project and set:

```text
SENTRY_DSN=
```

If `SENTRY_DSN` is missing, Xreviews runs with Sentry disabled. Do not send raw review body, raw email, raw phone, evidence object keys, upload URLs, signed URLs, or public evidence URLs to Sentry context.

## GA4 / Microsoft Clarity

Create GA4 and Clarity properties. Configure:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

Scripts load only when these env vars are present.

Tracked event payloads are allowlisted. They must not contain raw review body, raw evidence object key, upload URL, signed URL, raw email, or raw phone.

## Admin bootstrap

Create or log in as the admin email, then promote by CLI:

```bash
pnpm admin:promote --email=admin@example.com
```

There is no web UI for admin role escalation.

Admin bootstrap rules:

- Create the first admin as a normal account through the app.
- Run the CLI from a trusted machine with `DATABASE_URL` configured.
- Do not add admin promotion to web UI.
- Protect admin email accounts with strong authentication.
- Review audit logs after promotion.

## Risk score recalculation

After seed data, moderation changes, or business response/improvement updates:

```bash
pnpm risk:recalculate
```

Only published reviews should affect public ranking and X-risk score.

## Pre-deploy checklist

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] `pnpm cf:build`
- [ ] `wrangler deploy --dry-run`
- [ ] `git diff --check`
- [ ] Neon database migrated
- [ ] Seed data loaded
- [ ] R2 private bucket created
- [ ] Cloudflare env/secrets set
- [ ] BetterAuth URL points to production app URL
- [ ] Resend sender configured
- [ ] Sentry/GA4/Clarity env set or intentionally blank
- [ ] Admin user promoted by CLI
- [ ] `pnpm risk:recalculate` run
- [ ] Positive-review block verified
- [ ] Medical guardrail verified
- [ ] Pending/hidden/disputed/removed reviews hidden from public pages
- [ ] Evidence object keys and URLs absent from public pages
- [ ] Business users cannot delete or change review status
- [ ] Staging smoke test complete: `docs/beta/STAGING_SMOKE_TEST_CHECKLIST.md`
- [ ] Contact placeholders replaced: `docs/legal-ops/CONTACT_CHANNELS.md`
- [ ] Supabase, Vercel, Pinecone configs absent
