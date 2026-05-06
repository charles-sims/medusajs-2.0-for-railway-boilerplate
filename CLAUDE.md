# CLAUDE.md — Project Context
<!-- PROJECT_STATE: commit=ca07313 timestamp=2026-05-05T17:00:00-07:00 health=82 -->

## Project Identity
- **Name**: CaliLean (peptide/RUO wellness storefront)
- **Type**: pnpm monorepo — 2 apps + 10 workspace plugins
- **Platform**: Web — headless e-commerce
- **Stack**: TypeScript, Medusa.js 2.14.1, Next.js 15, React 18/19, Tailwind CSS 3, pnpm 9.10.0
- **Architecture**: Medusa backend API (port 9000) + Next.js SSR storefront (port 8000) + 10 plugin packages
- **Deployment**: Railway (nixpacks.toml + railway.toml)
- **Health**: 82/100 (needs attention — dirty working tree, duplicate docs)

## Development Commands
```bash
# Root (runs all apps via Turbo)
pnpm install
pnpm turbo build

# Backend
cd apps/backend && pnpm install
cp .env.template .env   # configure DATABASE_URL + secrets
pnpm dev                # API at localhost:9000, admin at /app

# Storefront
cd apps/storefront && pnpm install
cp .env.local.template .env.local
pnpm dev                # localhost:8000

# Tests
cd apps/backend && pnpm test:coverage     # Jest unit + coverage
cd apps/storefront && pnpm test-e2e       # Playwright (needs backend running)

# Email preview
cd apps/backend && pnpm email:dev         # localhost:3002
```

## Key Architecture Notes
- Storefront: Next.js App Router with `[countryCode]` i18n routing; async `cookies()` required (Next.js 15)
- Backend modules conditionally loaded by env vars: Redis, MinIO, MeiliSearch, Sanity, Segment, Sentry
- Plugins: `packages/plugin-{erp,subscription,shipstation,email,loyalty,bundles,invoices,preorder,qr-marketing,reviews}`
- ERP: ERPNext integration via `packages/plugin-erp/` — Sales Invoice + Payment Entry auto-submit
- Payments: NMI card (`payment-nmi-card`) + NMI ACH (`payment-nmi`) + Stripe
- Auth: Google OAuth gate at storefront `/` — Boids animation, server-side redirect
- RUO: Per-state checkout suppression via `apps/backend/src/lib/ruo*`
- Path aliases (storefront): `@lib/*`, `@modules/*`, `@pages/*`

## Active Issues
1. **Uncommitted changes** — `apps/storefront/.../checkout/components/payment/index.tsx` modified, `trigger-resync.ts` untracked
2. **Duplicate docs** — `docs/strategy/` and `docs/compliance/` duplicate `docs/ops/` subdirs
3. **No per-package CLAUDE.md** — `apps/storefront/` and `packages/plugin-erp/` lack AI context files

## Next Action
Tag `v0.2.0` — 327 commits of core platform work is complete (rebrand, ERPNext, NMI, auth gate, RUO compliance). Then commit/clean uncommitted work and validate ERPNext Payment Entry sync end-to-end.

## Full Context
For detailed audit, health scorecard, roadmap, and changelog, see `.project-state/`:
- `.project-state/audit.md` — Full discovery findings, services, docs inventory
- `.project-state/health.md` — Structural health scorecard with remediation steps
- `.project-state/roadmap.md` — Reconciled roadmap with prioritized next steps
- `.project-state/changelog.md` — Generated changelog since v0.1.0
