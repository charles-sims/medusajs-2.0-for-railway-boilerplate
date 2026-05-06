# Roadmap Reconciliation — CaliLean

> Generated: 2026-05-05 | Commit: `ca07313`

---

## Previously Planned Items — Status Update

| Item | Source | Status | Evidence |
|------|--------|--------|----------|
| Add CI/CD pipeline | Prior roadmap | ✅ Done | `.github/workflows/ci.yml` — build, test, E2E jobs |
| Create CLAUDE.md | Prior roadmap | ✅ Done | Root `CLAUDE.md` present |
| Update README for CaliLean brand | Prior roadmap | ✅ Done | README updated during rebrand |
| Add password update support | Prior roadmap | ✅ Done | Profile password component updated |
| Fix inventory management (cart) | Prior roadmap (TODO #8) | ⚠️ Active | Some work done; TODOs still present in cart |
| Add gift card support | Prior roadmap (TODO #6) | Defer | Medusa v2 feature gap |
| Email update support | Prior roadmap (TODO #3) | Defer | Medusa v2 API limitation |

---

## New Completed Work (Since v0.1.0)

| Feature | Evidence | Commits |
|---------|----------|---------|
| CaliLean rebrand (Bluum → CaliLean) | New brand tokens, wordmark, palette, Switzer font | `01947b2`, `fd52a6` |
| Auth gate with Google OAuth | `apps/storefront/src/app/api/auth/google/` | `7fb9fd5`, `9e9bf33` |
| Boids flocking animation on gate | `apps/storefront/src/modules/common/components/particle-swarm/` | Multiple style commits |
| ERPNext integration | `packages/plugin-erp/` — Sales Invoice + Payment Entry + auto-submit | `651ac77`, `ca07313` |
| NMI credit card payment | `apps/backend/src/modules/payment-nmi-card/` | `48702dc`, `8c05d04` |
| RUO compliance system | Per-state suppression, age gate, attestation checkout | `623af24`, `3c56421` |
| COA admin panel | `apps/backend/src/admin/widgets/coa-panel.tsx` + upload routes | `034904767` |
| SEO: sitemap, robots, OG, JSON-LD | Storefront SEO infrastructure | `38cfba1` |
| Research MDX pages | `apps/storefront/content/research/*.mdx` (15 peptide articles) | `d831ac0` |
| Subscription plugin | `packages/plugin-subscription/` — recurring orders | Full plugin |
| ShipStation plugin | `packages/plugin-shipstation/` — labels + tracking | Full plugin |
| Loyalty plugin | `packages/plugin-loyalty/` | Full plugin |
| Store view toggle | By Pathway / All Products toggle | `d93ad23` |
| Product imagery refresh | v1, v1.1, v2 renders + MinIO upload scripts | Multiple |
| Backend Jest tests | Unit tests + coverage in CI | `7530f05` |
| E2E seed fixtures | Ported to Medusa v2 auth | `911d31d` |
| Monorepo restructure | `storefront/` → `apps/storefront/` | Restructure commits |

---

## Inline TODOs (Current)

| # | File | Line | TODO | Classification | Priority |
|---|------|------|------|----------------|----------|
| 1 | `apps/storefront/check-env-variables.js` | 6 | Need doc link for env vars | Relevant | Defer |
| 2 | `apps/storefront/src/lib/data/cart.ts` | 283 | Pass POJO instead of form entity | Relevant | Nice to Have |
| 3 | `apps/storefront/src/modules/order/components/order-details/index.tsx` | 44 | Check where order statuses come from | Relevant | Nice to Have |
| 4 | `apps/storefront/src/modules/checkout/components/payment-button/index.tsx` | 33 | Add gift card support | Defer | Defer (Medusa v2 gap) |
| 5 | `apps/storefront/src/modules/account/components/profile-email/index.tsx` | 19 | Email update not supported | Defer | Defer (Medusa v2 gap) |

---

## Prioritized Next Steps

### 🔴 Critical Path

1. **Commit uncommitted changes** — `payment/index.tsx` is modified and `trigger-resync.ts` is untracked. Risk of accidental data loss. These should be committed or cleaned up before any new work.

2. **Validate ERPNext Payment Entry sync end-to-end** — The latest commit fixed auto-submit of Payment Entries. This is a critical business flow (orders → ERPNext accounting). Verify the full happy path: order placed → Sales Invoice created + submitted → payment captured → Payment Entry created + submitted.

### 🟡 High Value

3. **Clean up duplicate documentation** — 5+ duplicate files across `docs/strategy/`, `docs/compliance/`, `docs/ops/`. Delete the root-level duplicates; canonical versions live in `docs/ops/`. Trivial effort, reduces confusion.

4. **Add `apps/storefront/CLAUDE.md`** — Storefront is the most AI-touched app but has no per-app AI context. Document the `[countryCode]` routing pattern, module structure, and Next.js 15 async cookies pattern.

5. **Add `packages/plugin-erp/CLAUDE.md`** — The ERP plugin is complex (ERPNext + QuickBooks providers, bidirectional sync, idempotency logic). Document the provider interface, sync flow, and account configuration requirements.

6. **Wire storefront to NMI payment UI** — The `apps/storefront/src/modules/checkout/components/payment/index.tsx` file has uncommitted changes related to NMI. Complete and ship this to give customers the card payment UI.

### 🟢 Nice to Have

7. **Add Prettier config** — Enforce formatting consistency across monorepo.

8. **Refactor cart.ts POJO** (TODO #2) — Minor code quality improvement.

9. **Tag a v0.2.0 release** — 327 commits of significant work (rebrand, ERPNext, NMI payments, auth gate, RUO compliance). This deserves a named release.

### Defer

- Gift card support (Medusa v2 feature gap)
- Email update in account (Medusa v2 API limitation)
- Env variable doc link (low value)

---

## Archived Items

| Item | Reason |
|------|--------|
| "Add CI/CD pipeline" | Done — full CI in `.github/workflows/ci.yml` |
| "Create CLAUDE.md" | Done |
| "Update README for brand" | Done during CaliLean rebrand |
| "Add password update" | Done |
