# CaliLean

**Bluum-branded CBD & wellness e-commerce storefront** built on [Medusa.js 2.13.6](https://medusajs.com) + [Next.js 15](https://nextjs.org), deployed on [Railway](https://railway.app).

Forked from [rpuls/medusajs-2.0-for-railway-boilerplate](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate).

## Live URLs

| Service | URL |
|---------|-----|
| Storefront | [calilean.com](https://calilean.com) |
| Admin Dashboard | [admin.calilean.com/app](https://admin.calilean.com/app) |

## Architecture

```
CaliLean/
├── backend/          # Medusa 2.13.6 — Commerce API + Admin (port 9000)
├── storefront/       # Next.js 15 — SSR storefront (port 8000)
└── scripts/          # Product seed data tooling
```

**Headless commerce** — the Medusa backend serves a REST API consumed by the Next.js storefront via server-side rendering. The storefront uses the App Router with `[countryCode]` i18n routing.

## Bluum Brand Features

- Custom design tokens, Switzer font, brand color palette
- 21+ age gate modal on first visit
- Trust badges and research disclaimer components
- Lab-tested banner and value propositions
- Product specs table with metadata display
- FAQ accordion
- 33 seed products with peptide metadata

## Integrations (all optional, graceful fallbacks)

| Integration | Purpose | Fallback |
|-------------|---------|----------|
| PostgreSQL | Database | Required |
| Redis | Event bus + workflow engine | Simulated in-memory |
| MinIO | Cloud file storage | Local file storage |
| MeiliSearch | Product search | No search |
| Stripe | Payment processing | No payment |
| SendGrid / Resend | Transactional email | No email |

## Local Development

### Backend

```bash
cd backend/
pnpm install
cp .env.template .env          # Configure DATABASE_URL
pnpm ib                        # Run migrations + seed
pnpm dev                       # Start backend (localhost:9000/app)
```

### Storefront

```bash
cd storefront/
pnpm install
cp .env.local.template .env.local   # Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
pnpm dev                            # Start storefront (localhost:8000)
```

### Other Commands

```bash
# Storefront lint
cd storefront/ && pnpm lint

# Email template preview
cd backend/ && pnpm email:dev        # localhost:3002

# E2E tests (requires running backend + storefront)
cd storefront/ && pnpm test-e2e

# Seed products (requires running backend)
MEDUSA_ADMIN_PASS=<password> python3 scripts/seed-products.py
```

### Requirements

- **Node.js 22.x**
- **pnpm 9.10+**
- **PostgreSQL** (local or remote)

## Deploy on Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/medusajs-2136-storefront-new)

Railway auto-configures PostgreSQL, Redis, MinIO, and MeiliSearch via the one-click template.

## License

MIT
