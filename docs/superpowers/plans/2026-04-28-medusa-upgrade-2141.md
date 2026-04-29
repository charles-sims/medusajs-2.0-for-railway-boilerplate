# Medusa 2.13.6 → 2.14.1 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade CaliLean from Medusa 2.13.6 to 2.14.1 with pnpm workspace, Turborepo, pinned deps, and Zod v4 migration.

**Architecture:** Add root workspace config (3 files) without moving directories. Bump all @medusajs/* to 2.14.1 in both backend and storefront. Migrate Zod v3 → v4 in 7 custom files. Keep all custom modules (none have official replacements that match). Add dtc-starter as upstream remote for future tracking.

**Tech Stack:** Medusa 2.14.1, pnpm 10.11.1, Turborepo, Zod 4.2.0, Next.js 15, React 19

---

## File Map

### New files (root)
- `pnpm-workspace.yaml` — declares workspace packages
- `turbo.json` — task orchestration config
- `package.json` — root workspace package with scripts

### Modified files
- `backend/package.json` — bump all @medusajs/* to 2.14.1, add zod 4.2.0, remove packageManager
- `storefront/package.json` — pin all @medusajs/* from preview to 2.14.1, remove packageManager
- `backend/src/admin/routes/settings/invoice-config/page.tsx:27-28` — migrate `zod.string().email()` and `zod.string().url()` to Zod v4 top-level validators

### Files to verify (no changes expected)
- `backend/src/api/store/reviews/route.ts` — Zod usage is v4-compatible
- `backend/src/api/store/carts/[id]/line-item-bundles/route.ts` — v4-compatible
- `backend/src/api/admin/variants/[id]/preorders/route.ts` — v4-compatible
- `backend/src/api/admin/reviews/status/route.ts` — v4-compatible
- `backend/src/api/admin/invoice-config/route.ts` — v4-compatible
- `backend/src/api/admin/bundled-products/route.ts` — v4-compatible
- `backend/medusa-config.js` — no changes needed

---

### Task 1: Create root workspace config

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `package.json` (root)
- Modify: `backend/package.json` (remove packageManager field)
- Modify: `storefront/package.json` (remove packageManager field)

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

Create file at repo root `/Users/mikebelloli/Development/projects-skafld/CaliLean/pnpm-workspace.yaml`:

```yaml
packages:
  - "backend"
  - "storefront"
  - "!backend/.medusa/**"
```

- [ ] **Step 2: Create `turbo.json`**

Create file at repo root `/Users/mikebelloli/Development/projects-skafld/CaliLean/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": []
    },
    "seed": {
      "outputs": []
    }
  }
}
```

- [ ] **Step 3: Create root `package.json`**

Create file at repo root `/Users/mikebelloli/Development/projects-skafld/CaliLean/package.json`:

```json
{
  "name": "calilean",
  "private": true,
  "packageManager": "pnpm@10.11.1",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "pnpm -r dev",
    "build": "pnpm -r build",
    "start": "turbo start",
    "lint": "turbo lint",
    "test": "turbo test",
    "backend:dev": "turbo dev --filter=medusa-2.0-boilerplate-backend",
    "storefront:dev": "turbo dev --filter=medusa-next"
  },
  "pnpm": {
    "overrides": {
      "@types/react": "19.0.5",
      "@types/react-dom": "19.0.5"
    }
  },
  "devDependencies": {
    "turbo": "^2.0.14"
  }
}
```

- [ ] **Step 4: Remove `packageManager` from `backend/package.json`**

In `backend/package.json`, delete the line:
```json
  "packageManager": "pnpm@9.10.0",
```

- [ ] **Step 5: Remove `packageManager` from `storefront/package.json`**

In `storefront/package.json`, delete the line:
```json
  "packageManager": "pnpm@9.10.0",
```

- [ ] **Step 6: Verify workspace setup**

Run from repo root:
```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
corepack enable && corepack prepare pnpm@10.11.1 --activate
pnpm install
```

Expected: pnpm recognizes both workspace packages, installs successfully. You should see output referencing both `medusa-2.0-boilerplate-backend` and `medusa-next` packages.

- [ ] **Step 7: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add pnpm-workspace.yaml turbo.json package.json backend/package.json storefront/package.json
git commit -m "chore: add pnpm workspace + Turborepo, upgrade to pnpm 10"
```

---

### Task 2: Bump backend @medusajs/* to 2.14.1

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Update backend dependencies**

In `backend/package.json`, update these dependencies:

```json
{
  "dependencies": {
    "@medusajs/admin-sdk": "2.14.1",
    "@medusajs/admin-shared": "2.14.1",
    "@medusajs/cli": "2.14.1",
    "@medusajs/dashboard": "2.14.1",
    "@medusajs/draft-order": "2.14.1",
    "@medusajs/framework": "2.14.1",
    "@medusajs/icons": "2.14.1",
    "@medusajs/js-sdk": "2.14.1",
    "@medusajs/medusa": "2.14.1",
    "@medusajs/notification-sendgrid": "2.14.1",
    "@medusajs/payment-stripe": "2.14.1",
    "@medusajs/ui": "4.1.8",
    "@medusajs/workflow-engine-redis": "2.14.1",
    "zod": "4.2.0"
  },
  "devDependencies": {
    "@medusajs/orchestration": "2.14.1",
    "@medusajs/test-utils": "2.14.1"
  }
}
```

All other dependencies (axios, minio, pdfmake, resend, ulid, etc.) remain unchanged.

- [ ] **Step 2: Install and verify**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
pnpm install
```

Expected: Install succeeds with no peer dependency errors related to @medusajs packages.

- [ ] **Step 3: Run database migration**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
npx medusa db:migrate
```

Expected: Migration runs successfully. May output new tables or columns for 2.14.x features.

- [ ] **Step 4: Verify backend starts**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
pnpm dev
```

Expected: Server starts on port 9000, admin dashboard loads at http://localhost:9000/app. Watch for Zod-related errors in console — these will be fixed in Task 4.

If there are Zod errors, note them but continue — Task 4 fixes them.

- [ ] **Step 5: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add backend/package.json backend/pnpm-lock.yaml pnpm-lock.yaml
git commit -m "chore: bump backend @medusajs/* to 2.14.1"
```

Note: the lock file may be at root level now with workspace setup. Add whichever lock file changed.

---

### Task 3: Pin storefront @medusajs/* to 2.14.1

**Files:**
- Modify: `storefront/package.json`

- [ ] **Step 1: Update storefront dependencies**

In `storefront/package.json`, update these dependencies:

```json
{
  "dependencies": {
    "@medusajs/icons": "2.14.1",
    "@medusajs/js-sdk": "2.14.1",
    "@medusajs/types": "2.14.1",
    "@medusajs/ui": "2.14.1"
  },
  "devDependencies": {
    "@medusajs/ui-preset": "2.14.1"
  }
}
```

Also check if `@medusajs/client-types` (currently `preview`) is still needed. Run:
```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront
grep -r "@medusajs/client-types" src/
```

If no imports found, remove it from devDependencies. If imports exist, update to `2.14.1`.

All other dependencies (next, react, gray-matter, next-mdx-remote, etc.) remain unchanged.

- [ ] **Step 2: Install and verify**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
pnpm install
```

Expected: Install succeeds. The `preview` tag deps are now pinned to exact `2.14.1`.

- [ ] **Step 3: Verify storefront builds**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront
pnpm build:next
```

Expected: Next.js build succeeds. Watch for type errors — `@medusajs/types` may have new or changed type definitions in 2.14.1. If there are type errors, note them for fixing.

- [ ] **Step 4: Verify storefront dev server**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront
pnpm dev
```

Expected: Storefront loads at http://localhost:8000. Product pages, research pages, auth gate, checkout all render correctly.

- [ ] **Step 5: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add storefront/package.json pnpm-lock.yaml
git commit -m "chore: pin storefront @medusajs/* to 2.14.1, remove preview tags"
```

---

### Task 4: Migrate Zod v3 → v4 in custom code

**Files:**
- Modify: `backend/src/admin/routes/settings/invoice-config/page.tsx:27-28`
- Verify (no changes): 6 other files with Zod usage

- [ ] **Step 1: Fix invoice-config admin page**

In `backend/src/admin/routes/settings/invoice-config/page.tsx`, line 27-28, change:

```typescript
// Before (Zod v3):
  company_email: zod.string().email().optional(),
  company_logo: zod.string().url().optional(),
```

To:

```typescript
// After (Zod v4):
  company_email: zod.email().optional(),
  company_logo: zod.url().optional(),
```

- [ ] **Step 2: Verify other Zod files are v4-compatible**

These files use only `z.string()`, `z.number()`, `z.object()`, `z.array()`, `z.enum()`, `z.preprocess()` which are unchanged in Zod v4. Confirm no changes needed by scanning:

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
grep -n "\.email()\|\.url()\|\.uuid()\|\.ip()\|\.emoji()\|nativeEnum\|\.strict()\|\.passthrough()\|\.deepPartial()\|\.merge(\|z\.record([^,]*)" src/api/ src/admin/ src/workflows/ src/modules/ -r
```

Expected: Only the lines you already fixed in step 1 should match (if any remain). If other matches appear, apply the same migration pattern:
- `.email()` on a string → `z.email()` (top-level)
- `.url()` on a string → `z.url()` (top-level)
- `.uuid()` on a string → `z.uuid()` (top-level)
- `z.nativeEnum(X)` → `z.enum(X)`
- `.strict()` → use `z.strictObject({...})`
- `z.record(valueSchema)` → `z.record(z.string(), valueSchema)`

- [ ] **Step 3: Verify backend builds with Zod v4**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
npx medusa build
```

Expected: TypeScript compilation succeeds with no Zod-related type errors.

- [ ] **Step 4: Test backend starts cleanly**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
pnpm dev
```

Expected: Server starts on port 9000 with no Zod errors in console. Test these routes manually:
- GET http://localhost:9000/admin/invoice-config (after logging in)
- The admin dashboard loads without console errors

- [ ] **Step 5: Commit**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add backend/src/admin/routes/settings/invoice-config/page.tsx
git commit -m "fix: migrate Zod v3 to v4 in custom admin validators"
```

---

### Task 5: Evaluate and upgrade custom modules

**Files:**
- Potentially modify: `backend/medusa-config.js` (if replacing any module)
- Verify: all 8 custom module directories in `backend/src/modules/`

This task is evaluation + compatibility verification, not a rewrite.

- [ ] **Step 1: Check official loyalty plugin scope**

The official `@medusajs/loyalty-plugin@2.14.1` provides **gift cards and account credits** — NOT loyalty points. Your custom `loyalty` module is a points-based system. These are different features. **Keep the custom module.**

Verify the custom loyalty module loads with 2.14.1:
```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
pnpm dev
```

Check console for errors related to the loyalty module. If none, it's compatible.

- [ ] **Step 2: Verify all custom modules load**

With the backend running from Step 1, check that all modules initialized by looking at the startup logs. Each module should either show "info" or load without errors:

Custom modules to verify:
1. `bundled-product`
2. `invoice-generator`
3. `loyalty`
4. `preorder`
5. `product-review`
6. `subscription`
7. `shipstation` (only loads if SHIPSTATION_API_KEY is set)
8. `email-notifications` (only loads if RESEND_API_KEY is set)
9. `minio-file` (only loads if MINIO_ENDPOINT is set)

If any module fails, check the error:
- If it's a Zod issue, apply the v4 migration pattern from Task 4.
- If it's a framework API change, check the 2.14.0 release notes for breaking changes and fix accordingly.
- If it's a missing dependency, install it.

- [ ] **Step 3: Verify admin routes load**

With backend running, navigate to:
- http://localhost:9000/app — admin dashboard loads
- http://localhost:9000/app/reviews — reviews page loads
- http://localhost:9000/app/bundled-products — bundled products page loads
- http://localhost:9000/app/subscriptions — subscriptions page loads
- http://localhost:9000/app/settings/invoice-config — invoice config page loads

Each page should render without errors in the browser console.

- [ ] **Step 4: Verify custom workflows**

Check that workflow hooks don't conflict with 2.14.1:
```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
grep -r "hooks.validate\|hooks.before\|hooks.after" src/workflows/hooks/ --include="*.ts"
```

Verify each hook file still references valid workflow names. The `completeCartWorkflow` and other core workflows should be unchanged in 2.14.1.

- [ ] **Step 5: Commit (only if changes were needed)**

If any fixes were required:
```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add -A backend/src/
git commit -m "fix: update custom modules for Medusa 2.14.1 compatibility"
```

If no changes were needed, skip this step.

---

### Task 6: Add upstream tracking remote

**Files:**
- None (git config only)

- [ ] **Step 1: Add dtc-starter as `medusa` remote**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git remote add medusa https://github.com/medusajs/dtc-starter.git
git fetch medusa
```

Expected: Remote added, refs fetched. You now have 3 remotes:
- `origin` → SkaFld-Ignite/CaliLean.git (your repo)
- `upstream` → rpuls/medusajs-2.0-for-railway-boilerplate.git (Railway template)
- `medusa` → medusajs/dtc-starter.git (official Medusa starter)

- [ ] **Step 2: Verify remotes**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git remote -v
```

Expected output:
```
medusa    https://github.com/medusajs/dtc-starter.git (fetch)
medusa    https://github.com/medusajs/dtc-starter.git (push)
origin    https://github.com/SkaFld-Ignite/CaliLean.git (fetch)
origin    https://github.com/SkaFld-Ignite/CaliLean.git (push)
upstream  https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate.git (fetch)
upstream  https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate.git (push)
```

- [ ] **Step 3: Verify version comparison works**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git show medusa/main:apps/backend/package.json | grep '"@medusajs/medusa"'
```

Expected: `"@medusajs/medusa": "2.14.1"` — matches your upgraded version.

No commit needed — this is git config only.

---

### Task 7: Full integration test

**Files:**
- None (testing only)

- [ ] **Step 1: Clean install from scratch**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
rm -rf node_modules backend/node_modules storefront/node_modules
pnpm install
```

Expected: Clean install succeeds using workspace hoisting.

- [ ] **Step 2: Start backend and verify**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/backend
pnpm dev
```

Expected:
- Server starts on port 9000
- No Zod errors in console
- Admin dashboard loads at http://localhost:9000/app
- Can log in to admin

- [ ] **Step 3: Start storefront and verify**

In a separate terminal:
```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront
pnpm dev
```

Expected:
- Storefront loads at http://localhost:8000
- Homepage renders with CaliLean branding
- Age gate works
- Product listing page shows all 15 products
- Product detail page renders (including research layout with MDX content)
- Research nav scrolls and highlights correctly
- Auth gate login/signup works
- Cart and checkout flow works

- [ ] **Step 4: Verify API connectivity**

```bash
curl -s http://localhost:9000/store/products | python3 -m json.tool | head -20
```

Expected: JSON response with product data, confirming backend API serves storefront correctly.

- [ ] **Step 5: Run storefront lint**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean/storefront
pnpm lint
```

Expected: No new lint errors introduced by the upgrade.

- [ ] **Step 6: Final commit and push**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git add -A
git status
```

If there are any remaining changed files (lock files, etc.):
```bash
git commit -m "chore: complete Medusa 2.13.6 → 2.14.1 upgrade with workspace setup"
git push origin master
```

---

## Troubleshooting Reference

### If pnpm workspace install fails
- Check that `pnpm-workspace.yaml` is at repo root
- Verify pnpm 10.x is active: `pnpm --version`
- If store path issues: `pnpm store prune && pnpm install`

### If `medusa db:migrate` fails
- Ensure DATABASE_URL is set in `backend/.env`
- Check that the database is running and accessible
- Try `npx medusa db:generate` first to see what migrations are pending

### If admin dashboard shows Zod errors
- Check browser console for the exact schema that fails
- The error will reference `z.record` or `.email()` or `.url()` — apply the v4 migration from Task 4
- Medusa's own admin code was already migrated to Zod v4 in 2.14.1, so errors will be in your custom code only

### If a custom module fails to load
- Check if it imports from `@medusajs/framework` — the API should be stable between 2.13.6 and 2.14.1
- Check if it uses Zod validators — apply v4 migration
- Check Medusa 2.14.0 release notes for any other breaking changes

### If storefront type errors
- `@medusajs/types` may have changed interfaces — check the specific type error
- `@medusajs/client-types` was deprecated — ensure imports use `@medusajs/types` instead
- Run `pnpm typecheck` in storefront to see all type errors at once
