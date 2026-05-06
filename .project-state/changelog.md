# Changelog — CaliLean

> Generated: 2026-05-05 | Window: v0.1.0 → HEAD (`ca07313`) | 327 commits

---

## [Unreleased] — Since v0.1.0 (2026-04-22)

*327 commits spanning 2026-04-23 to 2026-05-04. Grouped by category.*

---

### Features

#### ERPNext Integration (`packages/plugin-erp/`)
- `ca07313` 2026-05-04 — **fix(erp): auto-submit Payment Entries after creation**
- `7708624` 2026-05-04 — fix(erp): auto-submit Sales Invoices and set correct due_date
- `ef22be3` 2026-05-03 — feat(erp): add payment entity support to resync endpoint
- `651ac77` 2026-05-03 — feat(erp): complete integration — item codes, shipping, erp_ids persistence, configurable accounts
- `614fa54` 2026-05-03 — fix(erp): ensure ERPNext items exist before invoice creation
- `879d46e` 2026-05-03 — fix(erp): correct invoice price precision and add idempotency
- `39d9c77` 2026-05-03 — fix(erp): fix QBO price precision and enforce deletes from Medusa
- `06fa690` 2026-05-03 — fix(plugin-erp): fix ERPNext sync — ensure customer exists before invoice creation

#### NMI Payment Provider
- `48702dc` 2026-05-03 — **feat(payment): add NMI credit card payment provider** (266-line service with auth/capture/refund)
- `8c05d04` 2026-05-03 — fix(payment): use ModuleProvider wrapper for nmi-card module (startup crash fix)

#### Auth Gate + Google OAuth
- `e263484` 2026-05-04 — feat(gate): advanced swallow-like boids animation and public OAuth callback
- `9e9bf33` 2026-05-04 — feat(gate): implement Boids flocking animation and fix Google OAuth callback
- `7fb9fd5` 2026-04-27 — feat: auth gate, favicon fix, resend email config
- `cb7780e` 2026-04-28 — fix(auth-gate): server-side redirect after login/signup, loading states, error messages
- `9bb86ab` 2026-04-27 — fix(auth-gate): use isRedirectError for proper redirect detection

#### Storefront UI
- `d93ad23` 2026-04-27 — feat(storefront): add By Pathway / All Products view toggle on store page
- `79b5765` 2026-04-27 — feat(storefront): categorized product sections on store page
- `c1d1736` 2026-04-27 — feat(storefront): show product subtitle on home/PDP/view-all, hide on pathway view
- `7211484` 2026-04-27 — feat(storefront): hide multi-size variant picker, auto-select first variant
- `01a18de` 2026-04-27 — feat(catalog): re-land CL-XXX-DDDD SKU spec
- `d831ac0` 2026-04-28 — feat: add next-mdx-remote and MDX loading utility (research pages)
- `1584ef7` 2026-04-27 — fix(storefront): include +metadata on PDP product fetches

#### Brand & Design
- `fd52a6` 2026-04-27 — **rebrand: v2 palette, typography, logo, product images, domain update** (major)
- `26d97f2` 2026-04-27 — feat(auth-gate): polish gate page — mesh gradient aura, logo sizing, form card
- `c92cd90` 2026-04-27 — feat(brand): SKA-51 comprehensive messaging refresh across the site
- `b5c86a0` 2026-04-27 — feat(brand): SKA-47 v2 ship — 8 PDP composites from one master vial
- `bc8435f` 2026-04-26 — feat(brand): v1.1 retakes — NAD+ cap + MOTS-C composition
- `8550eb7` 2026-04-26 — feat(brand): SKA-42 v1 imagery swap + Admin-API migration script
- `c0b14f8` 2026-04-26 — feat(brand): SKA-43 metadata + dynamic OG/Twitter cards + PNG icon fallbacks

#### RUO Compliance
- `623af24` 2026-04-26 — feat(ruo): env-driven per-state checkout suppression hook
- `3c56421` 2026-04-26 — feat(ops): wire Slack alert on RUO geo-bypass audit
- `c0e5018` 2026-04-26 — feat(ruo): checkout attestation gate + audit subscriber
- `81630be` 2026-04-26 — feat(ruo): wire age gate copy to RUO constants
- `debeb15` 2026-04-26 — feat(ruo): scaffold disclaimer constants + base component

#### Admin / COA
- `034904` 2026-04-26 — feat(admin): COA batch widget for product detail page
- `d8e670` 2026-04-26 — feat(coa): structured coa_panel + per-batch values + file links
- `cd7ec2` 2026-04-26 — feat(coa): admin upload + values routes for product COA panel

#### SEO
- `38cfba1` 2026-04-26 — feat(seo): sitemap, robots, manifest, OG/Twitter, JSON-LD

#### Backend Features
- `5859a85` 2026-04-23 — feat: password update, error enforcement, backend lint, and project docs
- `4ca7b32` 2026-04-27 — feat(storefront): copy refresh — outcome-aware subtitle layer
- `3c56421` 2026-04-26 — feat(ops): Slack alert on RUO geo-bypass

---

### Fixes

#### Next.js 15 Compatibility
- `bba41a7` 2026-04-23 — fix: await cookies() in remaining components for Next.js 15
- `848984a` 2026-04-23 — fix: await cookies() in onboarding.ts
- `641bdd7` 2026-04-23 — fix: await async getAuthHeaders() calls (TypeScript errors)
- `c0993007` 2026-04-23 — fix: remove extraneous customer property from useFormState

#### Storefront
- `2182f45` 2026-04-24 — fix: checkout flow, React 19 compat, pricing, Stripe integration
- `062244f` 2026-05-03 — fix(storefront): flip login gate animation to attraction swarm effect
- `8fc037c` 2026-04-27 — fix(storefront): remove client-side fade-in from Thumbnail
- `4b727ce` 2026-04-27 — fix(storefront): update store subheading to be view-agnostic
- `2d6c492` 2026-04-27 — fix(brand): replace Vercel default favicon.ico with CaliLean c mark
- `c1deaac` 2026-04-27 — fix(brand): restore hero H1 + deduplicate announcement bar
- `f0b02fe` 2026-04-27 — fix(storefront): footer cleanup — drop dead links, single contact email
- `58a552c` 2026-04-26 — fix: remove /100 price division in JSON-LD
- `1584ef7` 2026-04-27 — fix(storefront): include +metadata on PDP product fetches

#### Plugin Fixes
- `36cade0` 2026-05-03 — fix(plugins): move shared deps to peerDependencies (fixes Admin UI crash)
- `44886af` 2026-05-03 — fix(plugin-erp): add missing root export entry point
- `57bad14` 2026-05-03 — fix(erp): use public getDocument instead of private fetchWithRetry

---

### CI/CD

- `e14d98f` 2026-04-26 — ci: add test-backend, typecheck-storefront, E2E jobs (SKA-5)
- `f6954e6` 2026-04-26 — ci: build storefront with NODE_ENV=production inside E2E job
- `09b0a73` 2026-04-26 — ci: redirect E2E backend log out of watched tree
- `ed63f94` 2026-04-26 — fix(ci): unblock master build
- `664245e` 2026-05-03 — chore(build): force turbo rebuild to pick up NMI payment providers
- `c54ab25` 2026-05-03 — chore(build): optimize Railway build caching

---

### Tests

- `7530f05` 2026-04-26 — test: backend jest scaffold + storefront typecheck script
- `be01b85` 2026-04-27 — test(e2e): skip v1-boilerplate specs pending CaliLean catalog port
- `911d31d` 2026-04-27 — fix(e2e): port seed fixtures to Medusa v2 auth + publishable key

---

### Documentation

- `0db0619` 2026-05-03 — docs: include admin and peer dependency migration plans
- `6f4f7d0` 2026-04-26 — docs(compliance): state-by-state RUO posture map
- `feda12c` 2026-04-26 — docs(compliance): counsel-required questions list
- `2e18d65` 2026-04-26 — docs(compliance): C&D / FDA warning-letter response playbook
- `4ca7b32` 2026-04-27 — docs: copy refresh design spec

---

### Refactoring & Chore

- `6cf3991` 2026-05-03 — chore(backend): remove npm engine constraint (project uses pnpm exclusively)
- `f43c191` 2026-04-26 — chore: add conformance files
- `81968ba` 2026-04-26 — chore: clean up imagery renders — remove duplicates

---

## [v0.1.0] — 2026-04-22 (Baseline Tag)

Tagged as baseline. 241 commits of initial project setup, including:
- Fork from rpuls/medusajs-2.0-for-railway-boilerplate
- Medusa v2 upgrade and Next.js 15 compat fixes
- Initial CaliLean branding setup
- Railway deployment configuration
- Initial plugin scaffold

---

## 🏷️ Release Suggestion

**All major Phase 1 work appears complete:**
- ✅ CaliLean rebrand
- ✅ RUO compliance system
- ✅ ERPNext integration (with auto-submit)
- ✅ NMI payment provider
- ✅ Google OAuth auth gate
- ✅ CI/CD with tests

**Recommendation: Tag `v0.2.0` at current commit** to mark the completion of the core commerce + compliance platform.
