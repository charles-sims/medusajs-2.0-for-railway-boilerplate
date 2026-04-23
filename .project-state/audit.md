# Project Audit — CaliLean

> Generated: 2026-04-22 | Commit: `18ba182` | Branch: `master`

## Project Classification

| Field | Value |
|-------|-------|
| **Name** | CaliLean (Bluum-branded storefront) |
| **Type** | Multi-app repository (2 separate apps, no workspace config) |
| **Platform** | Web — headless e-commerce |
| **Stack** | TypeScript, Medusa.js 2.13.6, Next.js 15, React 19, Tailwind CSS 3, pnpm |
| **Architecture** | Headless commerce: Medusa backend API + Next.js SSR storefront |
| **Deployment** | Railway (one-click template) |
| **Origin** | Fork of `rpuls/medusajs-2.0-for-railway-boilerplate` |

## Repository Structure

```
CaliLean/
├── .github/
│   └── FUNDING.yml
├── .gitignore
├── README.md
├── scripts/
│   └── seed-products.py          # Product seed data generator
├── backend/                       # Medusa 2.13.6 backend
│   ├── package.json (pnpm)
│   ├── medusa-config.js
│   ├── tsconfig.json
│   ├── .env.template
│   └── src/
│       ├── admin/                 # Admin dashboard customizations (empty)
│       ├── api/                   # Custom API routes (admin, store, key-exchange)
│       ├── jobs/                  # Scheduled jobs (empty)
│       ├── lib/constants.ts       # Env var loader
│       ├── modules/
│       │   ├── email-notifications/  # Resend email provider + react-email templates
│       │   └── minio-file/           # MinIO file storage provider
│       ├── scripts/               # Seed scripts
│       ├── subscribers/           # Event subscribers (empty)
│       ├── utils/                 # Utility functions
│       └── workflows/             # Medusa workflows (empty)
└── storefront/                    # Next.js 15 storefront (Bluum brand)
    ├── package.json (pnpm)
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── .env.local.template
    ├── .eslintrc.js
    ├── .prettierrc
    ├── playwright.config.ts
    ├── e2e/                       # Playwright E2E tests (10 specs)
    ├── public/                    # Static assets
    └── src/
        ├── app/                   # Next.js App Router pages
        │   ├── [countryCode]/     # i18n routing
        │   │   ├── (checkout)/
        │   │   └── (main)/
        │   ├── api/               # API routes
        │   └── layout.tsx
        ├── lib/                   # Data fetching, utilities
        ├── modules/               # UI feature modules
        ├── styles/                # Global styles
        └── types/                 # TypeScript type definitions
```

## Git State

| Field | Value |
|-------|-------|
| **Branch** | `master` |
| **Status** | Clean working tree |
| **Remotes** | `origin` → SkaFld-Ignite/CaliLean.git, `upstream` → rpuls/medusajs-2.0-for-railway-boilerplate |
| **Tags** | None |
| **Total Commits** | 241 |
| **Last Commit** | `18ba182` — Merge branch 'rpuls:master' into master (2026-04-22) |

### Contributors

| Author | Commits |
|--------|---------|
| Rasmus Puls (upstream) | 210 |
| charles-sims | 17 |
| Alecia Vogel | 6 |
| Your Name | 4 |
| R P | 2 |
| Charles Sims | 2 |

## Services & Configuration

### Internal Services

| Service | Location | Purpose |
|---------|----------|---------|
| Medusa Backend | `backend/` | Commerce API, admin dashboard (port 9000) |
| Next.js Storefront | `storefront/` | Customer-facing store (port 8000) |
| Email Templates | `backend/src/modules/email-notifications/templates/` | React Email templates (order-placed, invite-user) |

### External Services

| Service | Provider | Config Location | Required |
|---------|----------|-----------------|----------|
| Database | PostgreSQL | `DATABASE_URL` | Yes |
| Cache/Queue | Redis | `REDIS_URL` | Optional (fallback to simulated) |
| File Storage | MinIO | `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | Optional (fallback to local) |
| Search | MeiliSearch | `MEILISEARCH_HOST`, `MEILISEARCH_ADMIN_KEY` | Optional |
| Payment | Stripe | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional |
| Email (option 1) | SendGrid | `SENDGRID_API_KEY`, `SENDGRID_FROM` | Optional |
| Email (option 2) | Resend | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional |

### Environment Variables

**Backend** (`.env.template`): `NODE_ENV`, `REDIS_URL`, `ADMIN_CORS`, `STORE_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`, `DATABASE_URL`, `MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `SENDGRID_API_KEY`, `SENDGRID_FROM`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MEILISEARCH_HOST`, `MEILISEARCH_MASTER_KEY`, `MEILISEARCH_ADMIN_KEY`

**Storefront** (`.env.local.template`): `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_MINIO_ENDPOINT`, `NEXT_PUBLIC_SEARCH_ENDPOINT`, `NEXT_PUBLIC_SEARCH_API_KEY`, `NEXT_PUBLIC_INDEX_NAME`

## Dependencies

### Backend (Medusa)
- **Package Manager**: pnpm 9.10.0
- **Runtime**: Node 22.x
- **Key Dependencies**: `@medusajs/*` 2.13.6, `minio`, `resend`, `@react-email/components`
- **Lock File**: Present (`pnpm-lock.yaml`)

### Storefront (Next.js)
- **Package Manager**: pnpm (via .yarnrc.yml compatibility)
- **Key Dependencies**: `next` 15.5.15, `react` 19.0.4, `tailwindcss` 3.4.19, `@medusajs/ui` preview, `@stripe/stripe-js`, `@meilisearch/instant-meilisearch`
- **Lock File**: Present (`pnpm-lock.yaml`)

## Documentation Inventory

### Summary

| Category | Count |
|----------|-------|
| Governance (Tier 1) | 1 (README.md only) |
| Package Docs (Tier 3) | 12 |
| **Total** | **13 markdown files** |

### Full Inventory

| Path | Category | Tier | Status | Action |
|------|----------|------|--------|--------|
| `README.md` | Governance | 1 | Current | Keep — but claims "Next.js 14" while using 15 |
| `backend/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/admin/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/api/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/jobs/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/modules/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/modules/email-notifications/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/modules/minio-file/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/scripts/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/subscribers/README.md` | Package Doc | 3 | Current | Keep |
| `backend/src/workflows/README.md` | Package Doc | 3 | Current | Keep |
| `storefront/README.md` | Package Doc | 3 | Current | Keep |
| `storefront/e2e/README.md` | Package Doc | 3 | Current | Keep |

### Missing Documentation

| File | Tier | Priority |
|------|------|----------|
| `CLAUDE.md` (root) | 1 | High — no AI coding context |
| `CONTRIBUTING.md` | 1 | Medium — no contributor guide |
| `LICENSE` | 1 | Medium — MIT claimed in package.json but no LICENSE file |
| `.env.example` (root) | 1 | Low — templates exist per-app |

### Docs-vs-Reality Gaps

1. **README.md claims "Next.js 14"** — storefront uses Next.js 15.5.15
2. **README.md references "Prebaked medusajs 2.0 monorepo"** — not a true monorepo (no workspace config)
3. **No CI/CD pipeline** — .github/ only has FUNDING.yml, no workflow files
4. **Bluum branding not documented** — 19 commits add Bluum-branded storefront (hero, footer, nav, product cards, age gate) but README still describes generic Medusa boilerplate

## Serena Memory Health

- **Status**: No `.serena/` directory found
- **Action**: N/A — Serena not configured for this project
