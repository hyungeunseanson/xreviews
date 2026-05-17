# 10 — Deployment Runbook

## Objective

Deploy Xreviews with near-zero monthly infrastructure cost.

## Services to create

1. GitHub repository
2. Cloudflare account/project
3. Neon Postgres project
4. Resend account/domain
5. Qdrant Cloud account, optional later
6. Sentry project
7. GA4 property
8. Microsoft Clarity project

## Cloudflare

Use:

- Workers/Pages for hosting/runtime
- R2 for evidence assets
- Turnstile for bot protection
- Queues later for async jobs

## Neon

Create a Neon Postgres database.

Set connection string:

```text
DATABASE_URL=postgresql://...
```

Use Drizzle migrations.

## R2

Create private bucket:

```text
xreviews-evidence-prod
```

Suggested object key pattern:

```text
private/reviews/{reviewId}/{evidenceId}/{safeFilename}
```

## Resend

Use for:

- email verification
- login links if magic link is used
- business claim notifications
- legal request receipt notification

## Sentry

Create project for Next.js.

Add DSN:

```text
SENTRY_DSN=
```

Scrub sensitive values.

## GA4 / Clarity

Add public IDs:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

## Local setup commands

Codex should adapt after scaffolding, but target commands:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
pnpm typecheck
pnpm test
```

## Cloudflare deployment commands

Expected pattern:

```bash
pnpm build
pnpm deploy
```

or OpenNext-specific:

```bash
pnpm opennextjs-cloudflare build
pnpm wrangler deploy
```

Codex must configure these based on the current OpenNext Cloudflare adapter package.

## Production checklist

- Environment variables set in Cloudflare dashboard
- Neon database migrated
- R2 bucket created and bound
- Turnstile keys added
- Resend API key added
- Sentry DSN added
- GA4/Clarity IDs added
- Admin user seeded or promoted manually
- Robots/sitemap configured
- Terms/privacy placeholders published
