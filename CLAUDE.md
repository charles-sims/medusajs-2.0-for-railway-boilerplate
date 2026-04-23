# CLAUDE.md — Project Context
<!-- PROJECT_STATE: commit=18ba182 timestamp=2026-04-22T18:45:37-07:00 health=66 -->

## Project Identity
- **Name**: CaliLean (Bluum-branded CBD/wellness storefront)
- **Type**: Multi-app repo (backend + storefront, no workspace config)
- **Platform**: Web — headless e-commerce
- **Stack**: TypeScript, Medusa.js 2.13.6, Next.js 15, React 19, Tailwind CSS 3, pnpm
- **Architecture**: Headless commerce — Medusa backend API (port 9000) + Next.js SSR storefront (port 8000)
- **Deployment**: Railway (one-click template)
- **Origin**: Fork of `rpuls/medusajs-2.0-for-railway-boilerplate`
- **Health**: 66/100 (unhealthy — no CI/CD, tests unverifiable)

## Development Commands
```bash
# Backend setup
cd backend/ && pnpm install
cp .env.template .env  # Then configure DATABASE_URL
pnpm ib               # Initialize backend (migrations + seed)
pnpm dev              # Start backend (admin at localhost:9000/app)

# Storefront setup
cd storefront/ && pnpm install
cp .env.local.template .env.local
pnpm dev              # Start storefront (localhost:8000)

# Storefront lint/format
cd storefront/ && pnpm lint

# Email template dev
cd backend/ && pnpm email:dev  # Preview at localhost:3002

# E2E tests (requires running backend + storefront)
cd storefront/ && pnpm test-e2e
```

## Key Architecture Notes
- Storefront uses Next.js App Router with `[countryCode]` i18n routing
- Backend modules are conditionally loaded based on env vars (Redis, MinIO, Stripe, SendGrid/Resend, MeiliSearch)
- Bluum brand: custom design tokens, Switzer font, 21+ age gate, trust badges
- 33 seed products with metadata in `scripts/seed-products.py`
- Path aliases: `@lib/*`, `@modules/*`, `@pages/*` (storefront)

## Active Issues
1. **No CI/CD pipeline** — No automated testing or build verification on PRs
2. **Inventory not checked in cart** — TODOs for v2 inventory management
3. **README outdated** — Still describes generic Medusa boilerplate, not Bluum brand

## Next Action
Add a GitHub Actions CI workflow that runs `pnpm build` for both backend and storefront on pull requests.

## Full Context
For detailed audit, health scorecard, roadmap, and changelog, see `.project-state/`:
- `.project-state/audit.md` — Full discovery findings, services, docs inventory
- `.project-state/health.md` — Structural health scorecard with remediation steps
- `.project-state/roadmap.md` — Reconciled roadmap with prioritized next steps
- `.project-state/changelog.md` — Generated changelog (full history)
