# Project Audit — CaliLean

> Generated: 2026-05-05 | Commit: `ca07313` | Branch: `master`

---

## Project Classification

| Field | Value |
|-------|-------|
| **Name** | CaliLean |
| **Type** | Monorepo (pnpm workspaces) |
| **Platform** | Web — headless e-commerce |
| **Primary Language** | TypeScript |
| **Frameworks** | Medusa.js 2.14.1, Next.js 15 |
| **Runtime** | Node 22, pnpm 9.10.0 |
| **Architecture** | Headless commerce: Medusa API (port 9000) + Next.js SSR storefront (port 8000) + 10 workspace plugins |
| **Deployment** | Railway (nixpacks.toml + railway.toml) |
| **Origin** | Forked from rpuls/medusajs-2.0-for-railway-boilerplate |

---

## Repository Structure

```
CaliLean/
├── apps/
│   ├── backend/                  # Medusa.js 2.14.1 API (port 9000)
│   │   ├── src/
│   │   │   ├── admin/            # Admin widgets: COA panel, Sanity sync
│   │   │   ├── api/              # Routes: COA, Sanity, restock subscriptions
│   │   │   ├── lib/              # RUO geo suppression, alert utilities
│   │   │   ├── modules/          # payment-nmi, payment-nmi-card, sanity, segment, restock
│   │   │   └── workflows/        # Medusa workflows
│   │   ├── scripts/              # E2E, diagnostic, E2E API test scripts
│   │   └── medusa-config.ts      # Plugin & provider registration
│   └── storefront/               # Next.js 15 SSR (port 8000)
│       ├── src/
│       │   ├── app/              # App Router — [countryCode] i18n routing
│       │   └── modules/          # bluum/, checkout/, products/, account/, etc.
│       ├── content/research/     # 15 MDX peptide research articles
│       └── e2e/                  # Playwright E2E tests (10 specs)
├── packages/                     # 10 Medusa plugins (workspace:*)
│   ├── plugin-bundles/
│   ├── plugin-email/             # CaliLean-branded transactional templates
│   ├── plugin-erp/               # ERPNext + QuickBooks integration
│   ├── plugin-invoices/
│   ├── plugin-loyalty/
│   ├── plugin-preorder/
│   ├── plugin-qr-marketing/
│   ├── plugin-reviews/
│   ├── plugin-shipstation/       # Labels + tracking webhooks
│   └── plugin-subscription/      # Recurring orders
├── docs/                         # Brand, compliance, ops, strategy docs
│   ├── brand/                    # Imagery prompts, packaging design, archives
│   ├── ops/                      # compliance/, strategy/, product/, pricing/
│   └── superpowers/plans/        # Implementation plans
├── scripts/                      # Product imagery render, seed, pricing scripts
├── .github/workflows/ci.yml      # CI: build-backend, test-backend, build-storefront, E2E
├── nixpacks.toml                 # Railway build + caching config
├── railway.toml                  # Railway deployment config
├── turbo.json                    # Turborepo build graph
└── pnpm-workspace.yaml
```

---

## Git State

| Field | Value |
|-------|-------|
| **Branch** | master |
| **HEAD** | `ca07313` — fix(erp): auto-submit Payment Entries after creation |
| **Date** | 2026-05-04 10:16 PDT |
| **Tags** | `v0.1.0` (2026-04-22) |
| **Working Tree** | ⚠️ Dirty — 1 modified, 1 untracked |
| **Modified** | `apps/storefront/src/modules/checkout/components/payment/index.tsx` |
| **Untracked** | `apps/backend/scripts/trigger-resync.ts` |
| **Remotes** | origin (SkaFld-Ignite/CaliLean), upstream (rpuls boilerplate), medusa (medusajs/dtc-starter) |
| **Commits since v0.1.0** | 327 |

---

## Services & Configuration

### Internal Services
| Service | Location | Status |
|---------|----------|--------|
| Medusa API | `apps/backend/` | Active |
| Next.js Storefront | `apps/storefront/` | Active |
| ERP Sync | `packages/plugin-erp/` | Active (ERPNext) |
| Subscriptions | `packages/plugin-subscription/` | Active |
| ShipStation | `packages/plugin-shipstation/` | Active |
| Email | `packages/plugin-email/` | Active (SendGrid) |
| Loyalty | `packages/plugin-loyalty/` | Active |
| Payment NMI Card | `apps/backend/src/modules/payment-nmi-card/` | Active |
| Payment NMI ACH | `apps/backend/src/modules/payment-nmi/` | Active |

### External Services
| Service | Purpose | Env Key(s) |
|---------|---------|------------|
| PostgreSQL | Primary database | `DATABASE_URL` |
| ERPNext | ERP accounting | `ERPNEXT_*` |
| NMI | Credit card + ACH | `NMI_API_KEY`, `NMI_TOKENIZATION_KEY`, `NMI_SANDBOX` |
| Stripe | Payment alternative | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` |
| SendGrid | Transactional email | `SENDGRID_API_KEY`, `SENDGRID_FROM` |
| Google OAuth | Customer auth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| Redis (optional) | Workflow engine | `REDIS_URL` |
| MinIO (optional) | File storage / COA PDFs | `MINIO_*` |
| MeiliSearch (optional) | Product search | `MEILISEARCH_*` |
| Sanity (optional) | CMS | `SANITY_*` |
| Segment (optional) | Analytics | `SEGMENT_WRITE_KEY` |
| Sentry (optional) | Error tracking | `SENTRY_DSN` |
| ShipStation | Shipping | `SHIPSTATION_API_KEY` |

---

## Dependencies

| | |
|-|-|
| **Package Manager** | pnpm 9.10.0 |
| **Lock file** | pnpm-lock.yaml ✅ |
| **Medusa** | 2.14.1 |
| **Next.js** | 15 |
| **React** | 18.x (backend/admin), 19.x (storefront) |
| **TypeScript** | Configured throughout |
| **Jest** | 29.x |
| **Playwright** | E2E |
| **Turbo** | Monorepo build orchestration |

---

## Documentation Inventory

### Summary
| Category | Count |
|----------|-------|
| Governance (root) | 5 (CLAUDE.md, README.md, CONTRIBUTING.md, DECISIONS.md, DESIGN.md) |
| Project State (.project-state/) | 5 |
| Compliance | 7 (duplicates across docs/compliance/ and docs/ops/compliance/) |
| Strategy | 8 (duplicates across docs/strategy/ and docs/ops/strategy/) |
| Brand | 14 (docs/brand/ — prompts, packaging, archives) |
| Ops / Product | 5 |
| Research Content | 15 MDX (apps/storefront/content/research/) |
| Package/App READMEs | 18 |
| Plans | 3 (docs/superpowers/plans/) |

### Docs-vs-Reality Gaps

1. **Duplicate compliance dir**: `docs/compliance/` duplicates `docs/ops/compliance/`
2. **Duplicate strategy dir**: `docs/strategy/` duplicates `docs/ops/strategy/`
3. **Duplicate pricing**: `docs/ops/pricing-research.md` = `docs/ops/pricing/pricing-research.md`
4. **Duplicate SKU doc**: `docs/ops/sku-system.md` = `docs/ops/product/sku-system.md`
5. **Duplicate suppression**: `docs/ops/per-state-suppression.md` = `docs/ops/compliance/per-state-suppression.md`
6. **Stale root file**: `PROJECT_STATE.md` superseded by `.project-state/` directory
7. **Missing AI context**: No CLAUDE.md in any plugin package or app subdirectory

### Remediation Plan (Priority Order)
| # | Action | Target | Effort |
|---|--------|--------|--------|
| 1 | Delete | `docs/strategy/` (entire dir) | Trivial |
| 2 | Delete | `docs/compliance/` (entire dir) | Trivial |
| 3 | Delete | `docs/ops/pricing-research.md` | Trivial |
| 4 | Delete | `docs/ops/sku-system.md` | Trivial |
| 5 | Delete | `docs/ops/per-state-suppression.md` | Trivial |
| 6 | Archive | `PROJECT_STATE.md` → delete | Trivial |
| 7 | Create | `apps/storefront/CLAUDE.md` | Small |
| 8 | Create | `packages/plugin-erp/CLAUDE.md` | Small |

---

## Serena Memory Health

No `.serena/memories/` directory — Serena is not onboarded.

---

## Best Practices Flags

| Issue | Location | Severity |
|-------|----------|----------|
| Uncommitted modified file | `apps/storefront/.../payment/index.tsx` | ⚠️ Warning |
| Untracked diagnostic script | `apps/backend/scripts/trigger-resync.ts` | ⚠️ Commit or delete |
