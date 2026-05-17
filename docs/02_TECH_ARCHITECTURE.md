# 02 — Technical Architecture

## Goal

Run the MVP as close to KRW 0/month as possible while still using production-grade primitives.

## Stack

| Layer | Choice |
|---|---|
| Repository | GitHub |
| Runtime/hosting | Cloudflare Workers/Pages with OpenNext Cloudflare adapter |
| Frontend | Next.js App Router + TypeScript + Tailwind CSS |
| API | Next route handlers and/or Hono mounted inside catch-all route |
| Database | Neon Postgres |
| ORM | Drizzle ORM |
| Auth | BetterAuth |
| Email | Resend |
| File storage | Cloudflare R2 |
| Bot protection | Cloudflare Turnstile |
| Async jobs | Cloudflare Queues, optional in first milestone |
| Vector search | Qdrant, later phase |
| Error monitoring | Sentry |
| Product analytics | GA4 + Microsoft Clarity |

## Architecture diagram

```text
User Browser
  ↓
Cloudflare DNS / WAF / Turnstile
  ↓
Cloudflare Workers / Pages
  ├─ Next.js App Router via OpenNext Cloudflare
  ├─ Public SEO pages
  ├─ Auth pages
  ├─ API route handlers / Hono handlers
  ├─ R2 signed upload/read endpoints
  └─ Moderation/business/admin dashboards
  ↓
Neon Postgres
  ├─ users / sessions
  ├─ subjects / locations
  ├─ reviews / tags / evidence metadata
  ├─ business claims / replies / improvements
  ├─ moderation cases / legal requests
  ├─ audit logs
  └─ analytics events
  ↓
Cloudflare R2
  └─ private evidence assets
  ↓
Resend
  └─ verification, login, business notifications
  ↓
Qdrant
  └─ future complaint clustering and semantic similarity
  ↓
Sentry / GA4 / Clarity
```

## Suggested repository structure

```text
xreviews/
  AGENTS.md
  package.json
  pnpm-workspace.yaml
  turbo.json                  optional
  apps/
    web/
      src/
        app/
          page.tsx
          search/page.tsx
          categories/[category]/page.tsx
          s/[slug]/page.tsx
          review/new/page.tsx
          business/claim/page.tsx
          business/dashboard/page.tsx
          admin/page.tsx
          admin/moderation/page.tsx
          api/[[...route]]/route.ts
        components/
        lib/
        server/
          auth/
          db/
          r2/
          moderation/
          scoring/
          analytics/
      next.config.ts
      open-next.config.ts
      wrangler.toml
  packages/
    db/
      src/schema.ts
      src/client.ts
      drizzle.config.ts
    shared/
      src/constants.ts
      src/validators.ts
  docs/
```

## Implementation principle

Prefer a single Next.js web app first. Do not split into microservices. Codex should only add a separate worker if a real limitation appears.

## Database access from Cloudflare

Use Neon serverless driver and Drizzle. Add Cloudflare Hyperdrive later if connection performance becomes an issue.

## R2 evidence storage

Evidence files must be private.

Public pages should show:

- evidence type
- evidence level
- blurred/thumbnail only if intentionally allowed
- never public raw evidence URL by default

Signed URLs should be time-limited.

## Environment variables

Core variables are defined in `templates/.env.example`.

## Deployment environments

| Env | Purpose |
|---|---|
| local | developer machine |
| preview | Cloudflare preview deployment |
| production | live site |

## Performance baseline

- Public pages should be server-rendered or statically cached where possible.
- Search query should be indexed by subject name, category, and location.
- Avoid loading evidence assets on list pages.
- Use pagination for reviews.
- Use edge caching for public category/ranking pages where possible.

## Do not overbuild in MVP

Not needed in first milestone:

- Advanced AI moderation
- Qdrant semantic clustering
- Full subscription billing
- Native mobile app
- Real-time notifications
- Crawlers
- Multi-language
