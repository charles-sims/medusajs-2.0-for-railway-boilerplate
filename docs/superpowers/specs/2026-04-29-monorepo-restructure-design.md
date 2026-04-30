# CaliLean Monorepo Restructure + Plugin Extraction + v2 Feature Parity

**Date:** 2026-04-29
**Status:** Approved
**Scope:** Structural migration, plugin extraction, built-in feature enablement, production optimization

---

## Problem Statement

CaliLean is a production DTC e-commerce platform (calilean.com) built on Medusa v2.14.1 with 8 custom modules, 50+ workflows, 33 API routes, 9 subscribers, and 18 brand-specific storefront components. The monorepo restructure attempted in early 2026 partially succeeded (~60%) — Turborepo works, but custom modules remain locked inside `backend/src/modules/` as relative paths. They are not extractable workspace packages.

Additionally, several built-in Medusa v2 features and production optimizations are not enabled, leaving gaps in translation, gift cards/store credit, analytics, error monitoring, caching, and storefront performance.

### Goals

1. Restructure the monorepo to follow Medusa's recommended `apps/` + `packages/` layout
2. Extract 9 custom features into Medusa v2 plugins (one per feature domain)
3. Enable all relevant built-in Medusa v2 modules and features
4. Bring storefront and backend to production-optimized state
5. Preserve git history, live deployment, and all custom business logic

### Non-Goals

- No storefront migration to DTC Starter (CaliLean's brand design is category-appropriate)
- No Sanity CMS visual redesign (integration only, for content management)
- No npm publishing of plugins (workspace-only, `private: true`)
- No CI/CD setup (separate initiative)
- No new business features beyond what Medusa v2 provides built-in

---

## Architecture Decisions

### AD-1: Restructure CaliLean in place (not migrate to cali-lean-v2)

cali-lean-v2 is the official DTC Starter template with zero custom work. CaliLean has 448 commits of production code. Migration would lose git history, deployment wiring, and contributor attribution for no structural gain that can't be achieved with `git mv`.

### AD-2: One plugin per feature domain (Medusa docs recommendation)

Medusa's plugin system (v2.3.0+) bundles modules + workflows + routes + subscribers + links + admin extensions into a single reusable package. The docs recommend scoping plugins to a single domain (e.g., wishlist plugin, brand plugin). CaliLean's 9 features map cleanly to 9 plugins.

### AD-3: Feature plugins register in `plugins[]`, provider plugins register providers in `modules[]`

Per Medusa docs: feature plugins auto-register their modules when added to the `plugins` config array. Provider plugins (fulfillment, file, notification) must additionally register their providers in the `modules` array using the path format `"plugin-name/providers/provider-name"`.

### AD-4: Cross-cutting orchestration stays in the application

Plugins are self-contained feature packages. Code that orchestrates across multiple plugins (order lifecycle subscribers, RUO compliance, workflow hooks touching multiple modules, shared utilities) stays in `apps/backend/src/`. This follows Medusa's two-layer model: plugins own features, the app owns the glue.

### AD-5: Custom loyalty module coexists with built-in Loyalty Plugin

Medusa's built-in Loyalty Module handles gift cards and store credit. CaliLean's custom loyalty module handles purchase-based points (earn/redeem with `calculatePointsFromAmount()`, `addPoints()`, `deductPoints()`). Different domains — both should coexist.

---

## Target Directory Structure

```
CaliLean/
├── apps/
│   ├── backend/                          # Medusa application (slim orchestration layer)
│   │   ├── src/
│   │   │   ├── admin/                    # App-specific admin (i18n config)
│   │   │   ├── api/                      # Cross-cutting routes (COA, key-exchange, custom)
│   │   │   ├── subscribers/              # Cross-cutting subscribers (order-*, ruo-*, apply-first-purchase)
│   │   │   ├── workflows/               # Cross-cutting workflows + hooks (validate-*, reorder, abandoned-carts)
│   │   │   ├── constants/               # Shared constants (first-purchase-discount)
│   │   │   ├── utils/                   # Shared utilities (assert-value, promo)
│   │   │   ├── lib/                     # App config (env vars)
│   │   │   ├── scripts/                 # CLI scripts
│   │   │   └── migration-scripts/       # Data seeding
│   │   ├── medusa-config.ts             # Converted from .js to .ts
│   │   └── package.json                 # Depends on @calilean/plugin-*
│   └── storefront/                       # Next.js 15 (existing, enhanced)
├── packages/
│   ├── plugin-shipstation/              # @calilean/plugin-shipstation
│   ├── plugin-loyalty/                  # @calilean/plugin-loyalty (points system)
│   ├── plugin-bundles/                  # @calilean/plugin-bundles
│   ├── plugin-preorder/                 # @calilean/plugin-preorder
│   ├── plugin-subscription/             # @calilean/plugin-subscription
│   ├── plugin-reviews/                  # @calilean/plugin-reviews
│   ├── plugin-invoices/                 # @calilean/plugin-invoices
│   ├── plugin-minio/                    # @calilean/plugin-minio (may be replaced by @medusajs/file-s3)
│   └── plugin-email/                    # @calilean/plugin-email
├── pnpm-workspace.yaml                  # apps/**, packages/**
├── turbo.json
└── package.json
```

---

## Plugin Inventory & Code Mapping

### Feature Plugins (register in `plugins[]`)

| Plugin | Module | Workflows/Steps | API Routes | Links | Subscribers | Admin | 
|---|---|---|---|---|---|---|
| `plugin-loyalty` | `loyalty/` | `apply-loyalty-on-cart`, `remove-loyalty-from-cart`, `handle-order-points` + steps | `store/carts/[id]/loyalty-points/`, `store/customers/me/loyalty-points/` | — | — | — |
| `plugin-bundles` | `bundled-product/` | `create-bundled-product`, `add-bundle-to-cart`, `remove-bundle-from-cart` + steps | `admin/bundled-products/`, `store/bundle-products/[id]/`, `store/carts/[id]/line-item-bundles/` | `bundle-product`, `bundle-item-product` | — | `bundled-products/page`, `create-bundled-product` component |
| `plugin-preorder` | `preorder/` | `upsert-product-variant-preorder`, `cancel-preorders`, `disable-preorder-variant`, `fulfill-preorder`, `complete-cart-preorder` + steps | `admin/variants/[id]/preorders/`, `admin/orders/[id]/preorders/`, `store/carts/[id]/complete-preorder/` | `preorder-variant`, `preorder-order` | `preorder-notification` | `preorder-widget`, `preorder-variant-widget` + hooks |
| `plugin-subscription` | `subscription/` | `create-subscription/`, `create-subscription-order/` + steps | `admin/subscriptions/`, `store/carts/[id]/subscribe/`, `store/customers/me/subscriptions/` | `subscription-customer`, `subscription-order`, `subscription-cart` | — | `subscriptions/page`, `subscriptions/[id]/page` |
| `plugin-reviews` | `product-review/` | `create-review`, `update-review` + steps | `admin/reviews/`, `store/products/[id]/reviews/`, `store/reviews/` | `review-product` | — | `reviews/page` |
| `plugin-invoices` | `invoice-generator/` | `generate-invoice-pdf`, `update-invoice-config`, `mark-invoices-stale` + steps | `admin/invoice-config/`, `admin/orders/[id]/invoices/`, `store/orders/[id]/invoices/` | — | — | `settings/invoice-config/page`, `order-invoice` widget |

### Provider Plugins (register providers in `modules[]`)

| Plugin | Provider Type | Provider Path |
|---|---|---|
| `plugin-shipstation` | Fulfillment | `@calilean/plugin-shipstation/providers/shipstation` |
| `plugin-minio` | File | `@calilean/plugin-minio/providers/minio-file` |
| `plugin-email` | Notification | `@calilean/plugin-email/providers/email-notifications` |

### Stays in `apps/backend/src/`

| Category | Files | Reason |
|---|---|---|
| Subscribers | `order-placed`, `order-updated`, `order-canceled`, `order-edit-confirmed`, `invite-created`, `ruo-attestation-audit`, `ruo-geo-audit`, `apply-first-purchase` | Cross-cutting / compliance / multi-plugin orchestration |
| Workflow hooks | `validate-promotion`, `validate-cart`, `complete-cart` | Hook into core Medusa flows, touch multiple modules |
| Workflows | `reorder`, `send-abandoned-carts`, `apply-first-purchase-promo`, `handle-order-edit` | Orchestration across multiple plugins |
| API routes | `admin/products/[id]/coa/`, `key-exchange/`, `admin/custom/`, `store/custom/`, `store/customers/me/orders/[id]/` | App-specific, not tied to a single plugin |
| Middleware | `middlewares.ts` | App-level route config |
| Constants/Utils/Lib | `constants/`, `utils/`, `lib/` | Shared app config |

---

## Plugin Package Structure

### `package.json` (per plugin)

```json
{
  "name": "@calilean/plugin-loyalty",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "files": ["src"],
  "peerDependencies": {
    "@medusajs/framework": "2.14.1",
    "@medusajs/medusa": "2.14.1"
  }
}
```

- `private: true` — workspace-only, flip to `false` + add build step when ready to publish
- Peer deps on `@medusajs/*` to avoid version duplication
- No build step needed during development — Medusa resolves TypeScript source directly

### Plugin directory structure (feature plugin)

```
packages/plugin-loyalty/
├── src/
│   ├── modules/
│   │   └── loyalty/
│   │       ├── models/loyalty-point.ts
│   │       ├── service.ts
│   │       ├── index.ts
│   │       └── migrations/
│   ├── workflows/
│   │   ├── apply-loyalty-on-cart.ts
│   │   ├── remove-loyalty-from-cart.ts
│   │   ├── handle-order-points.ts
│   │   └── steps/
│   ├── api/
│   │   └── store/
│   │       ├── carts/[id]/loyalty-points/route.ts
│   │       └── customers/me/loyalty-points/route.ts
│   └── links/
├── package.json
└── tsconfig.json
```

### Plugin directory structure (provider plugin)

```
packages/plugin-shipstation/
├── src/
│   ├── providers/
│   │   └── shipstation/
│   │       ├── service.ts
│   │       ├── client.ts
│   │       ├── types.ts
│   │       └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## Registration in `medusa-config.ts`

```typescript
import { defineConfig, Modules } from "@medusajs/framework/utils"
import { loadEnv } from "@medusajs/framework"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server" || "shared",
    http: { /* CORS config */ },
  },

  featureFlags: {
    translation: true,
    caching: true,
  },

  plugins: [
    "@calilean/plugin-shipstation",
    "@calilean/plugin-loyalty",
    "@calilean/plugin-bundles",
    "@calilean/plugin-preorder",
    "@calilean/plugin-subscription",
    "@calilean/plugin-reviews",
    "@calilean/plugin-invoices",
    "@calilean/plugin-minio",
    "@calilean/plugin-email",
  ],

  modules: [
    // Infrastructure modules (Redis-backed)
    { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl: process.env.REDIS_URL } },
    { resolve: "@medusajs/medusa/caching", options: { providers: [{ resolve: "@medusajs/caching-redis", id: "caching-redis", is_default: true, options: { redisUrl: process.env.REDIS_URL } }] } },
    { resolve: "@medusajs/medusa/workflow-engine-redis", options: { redis: { redisUrl: process.env.REDIS_URL } } },
    { resolve: "@medusajs/medusa/locking", options: { providers: [{ resolve: "@medusajs/medusa/locking-redis", id: "locking-redis", is_default: true, options: { redisUrl: process.env.REDIS_URL } }] } },

    // Translation module
    { resolve: "@medusajs/medusa/translation" },

    // Provider registrations from plugins
    ...(process.env.SHIPSTATION_API_KEY ? [{
      resolve: "@medusajs/medusa/fulfillment",
      options: { providers: [{ resolve: "@calilean/plugin-shipstation/providers/shipstation", id: "shipstation", options: { apiKey: process.env.SHIPSTATION_API_KEY } }] },
    }] : []),

    ...(process.env.MINIO_ENDPOINT ? [{
      resolve: "@medusajs/medusa/file",
      options: { providers: [{ resolve: "@calilean/plugin-minio/providers/minio-file", id: "minio", options: { endpoint: process.env.MINIO_ENDPOINT, accessKey: process.env.MINIO_ACCESS_KEY, secretKey: process.env.MINIO_SECRET_KEY, bucket: process.env.MINIO_BUCKET } }] },
    }] : []),

    ...(process.env.RESEND_API_KEY ? [{
      resolve: "@medusajs/medusa/notification",
      options: { providers: [{ resolve: "@calilean/plugin-email/providers/email-notifications", id: "resend", options: { apiKey: process.env.RESEND_API_KEY, fromEmail: process.env.RESEND_FROM_EMAIL } }] },
    }] : []),

    // Stripe (existing)
    ...(process.env.STRIPE_API_KEY ? [{
      resolve: "@medusajs/medusa/payment",
      options: { providers: [{ resolve: "@medusajs/medusa/payment-stripe", id: "stripe", options: { apiKey: process.env.STRIPE_API_KEY } }] },
    }] : []),

    // Analytics (new)
    ...(process.env.POSTHOG_API_KEY ? [{
      resolve: "@medusajs/medusa/analytics",
      options: { providers: [{ resolve: "@medusajs/analytics-posthog", id: "posthog", options: { apiKey: process.env.POSTHOG_API_KEY, host: process.env.POSTHOG_HOST } }] },
    }] : []),
  ],

  admin: {
    disable: process.env.ADMIN_DISABLED === "true",
  },
})
```

---

## Workspace Configuration

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/**"
  - "packages/**"
  - "!apps/backend/.medusa/**"
```

### `turbo.json`

Inherits existing task graph (build, dev, start, lint, test) with `packages/**` now included in the dependency chain.

---

## Migration Strategy

### Principle: Incremental. App never breaks. Validate after each phase.

### Validation gate (after every phase)

1. `pnpm install` — workspace resolves
2. `pnpm build` — compiles without errors
3. `medusa db:migrate` — migrations still run
4. Start backend — module loads and registers
5. Smoke test the feature's API routes

### Import update strategy

When a plugin is extracted, remaining code in `apps/backend/src/` that imported from the old path (e.g., `../../modules/loyalty`) updates to import from the plugin package (e.g., `@calilean/plugin-loyalty`). These are mostly module constants like `LOYALTY_MODULE` used in container resolution.

---

## Phase Plan

### Restructure (Phases 0-9)

| Phase | Work | Risk | Effort |
|---|---|---|---|
| **0** | Monorepo shell: `git mv backend/ apps/backend/`, `git mv storefront/ apps/storefront/`, update workspace/turbo/scripts/gitignore, verify builds | Low — directory rename only | 1-2 hours |
| **1** | ShipStation plugin (provider only, no models/migrations — simplest) | Low | 1-2 hours |
| **2** | MinIO plugin (provider only) | Low | 1 hour |
| **3** | Email plugin (provider + templates) | Low | 1-2 hours |
| **4** | Product Reviews plugin (simplest feature plugin: 1 model, 2 workflows) | Medium — first full plugin extraction | 2-3 hours |
| **5** | Loyalty plugin (1 model, 3 workflows, cross-cutting subscriber references) | Medium | 2-3 hours |
| **6** | Invoices plugin (2 models, loader, PDF gen, admin extensions) | Medium — first plugin with admin pages | 3-4 hours |
| **7** | Bundles plugin (2 models, 3 workflows, admin page + component, 2 links) | Medium | 3-4 hours |
| **8** | Subscription plugin (1 model, 2 workflows, 3 links, admin pages) | Medium | 3-4 hours |
| **9** | Preorder plugin (2 models, 5 workflows, 2 links, subscriber, admin widgets) | High — most complex | 4-5 hours |

### Quick Wins (Phases 10-11)

| Phase | Work | Effort |
|---|---|---|
| **10** | Fix `unoptimized: true` in next.config, add Product + Breadcrumb JSON-LD schema | 30 min |
| **11** | Convert `medusa-config.js` to `.ts`, add `redisUrl` to projectConfig, add `predeploy` script | 1 hour |

### Enable Built-in v2 Features (Phases 12-15)

| Phase | Work | Effort |
|---|---|---|
| **12** | Enable Translation Module: feature flag, config, db:migrate, configure locales in admin, add `sdk.setLocale()` + locale cookie to storefront | 2-3 hours |
| **13** | Install Loyalty Plugin (gift cards + store credit): `@medusajs/loyalty-plugin`, config, db:migrate, verify admin UI | 1-2 hours |
| **14** | Infrastructure audit: update Caching Module to v2.11+ pattern with Redis provider, enable `caching` feature flag, verify Locking Module with Redis, update workflow-engine-redis to use `redisUrl` (not deprecated `url`), verify Draft Orders in admin | 2-3 hours |
| **15** | Evaluate replacing custom MinIO module with `@medusajs/file-s3` configured for MinIO endpoint. If compatible, remove `plugin-minio` and use official provider. | 1-2 hours |

### Integrations (Phases 16-19)

| Phase | Work | Effort |
|---|---|---|
| **16** | Analytics: install PostHog or Segment analytics provider, configure in medusa-config, set up basic event tracking | 2-3 hours |
| **17** | Sentry error monitoring: follow official Medusa instrumentation guide | 1-2 hours |
| **18** | Complete email template set: shipping confirmation, password reset, refund notification, review request — using existing React Email + Resend infrastructure in CaliLean brand | 2-3 days |
| **19** | Sanity CMS: install `@sanity/client` in backend, create Sanity module for product content sync, set up Sanity studio in storefront at `/studio`, wire product sync subscriber, update PDPs to show Sanity content with MDX fallback | 1-2 days |

### Storefront & Production (Phases 20-25)

| Phase | Work | Effort |
|---|---|---|
| **20** | Storefront returns UI: implement customer RMA flow using `POST /store/returns` API, add return request page in account section | 1 day |
| **21** | Search UI polish: add faceted filtering, sorting options, and search analytics to MeiliSearch integration | 2-3 days |
| **22** | Storefront production optimization: implement ISR for PLPs, SSG for PDPs (static content), CSR for cart/checkout, optimize `fields` params in SDK calls, add TanStack Query with stale time config, implement optimistic cart updates | 2-3 days |
| **23** | Worker mode separation: configure `MEDUSA_WORKER_MODE` for separate server + worker instances in Railway deployment | 2-3 hours |
| **24** | Restock notifications: implement subscriber for variant back-in-stock events, add customer subscription UI | 1 day |
| **25** | Social auth (if relevant): enable Google auth provider for customer login | 2-3 hours |

---

## What Doesn't Change

- **Storefront brand identity** — CaliLean's design system, `calilean/` module, age gate, research pages stay as-is
- **Database** — migrations move with plugins but schema is unchanged
- **Git history** — `git mv` preserves file history
- **Railway deployment** — path updates only (`backend/` → `apps/backend/`)
- **Module business logic** — files move, code doesn't change
- **Existing API contracts** — all routes maintain same paths and behavior

---

## Risk Mitigation

- **Each phase is independently deployable** — if phase 5 breaks, phases 0-4 are already stable
- **Feature branch per phase** — easy rollback via git
- **Validation gate** enforced after every phase
- **No code rewrites** — this is structural migration, not refactoring
- **Provider modules extracted first** (simpler, no models) to prove the pattern before tackling feature plugins
