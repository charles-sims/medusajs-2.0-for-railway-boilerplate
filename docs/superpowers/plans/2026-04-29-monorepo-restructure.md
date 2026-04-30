# Monorepo Restructure + Plugin Extraction (Phases 0-9)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure CaliLean from `backend/` + `storefront/` flat monorepo into `apps/` + `packages/` layout, extracting 9 custom Medusa features into first-class Medusa v2 plugins.

**Architecture:** Each custom feature becomes a workspace plugin package under `packages/plugin-*/` following Medusa's plugin directory structure. Feature plugins register in `plugins[]`, provider plugins register providers in `modules[]`. Cross-cutting orchestration code stays in `apps/backend/src/`. The app never breaks — each task is independently deployable.

**Tech Stack:** Medusa v2.14.1, pnpm workspaces, Turborepo, TypeScript, Node.js 22

---

## File Structure Overview

### New files created by this plan

```
apps/                                    # git mv from root
  backend/                               # git mv from backend/
  storefront/                            # git mv from storefront/

packages/
  plugin-shipstation/
    src/
      providers/shipstation/
        index.ts                         # re-export ModuleProvider
        service.ts                       # moved from backend/src/modules/shipstation/service.ts
        client.ts                        # moved from backend/src/modules/shipstation/client.ts
        types.ts                         # moved from backend/src/modules/shipstation/types.ts
      index.ts                           # plugin entry: export constants
    package.json
    tsconfig.json

  plugin-minio/
    src/
      providers/minio-file/
        index.ts                         # re-export ModuleProviderExports
        service.ts                       # moved from backend/src/modules/minio-file/service.ts
      index.ts
    package.json
    tsconfig.json

  plugin-email/
    src/
      providers/email-notifications/
        index.ts                         # re-export ModuleProviderExports
        services/resend.ts               # moved
        lib/brand.ts                     # moved
        templates/                       # moved (all email templates)
      index.ts
    package.json
    tsconfig.json

  plugin-reviews/
    src/
      modules/product-review/            # moved from backend/src/modules/product-review/
      workflows/                         # moved: create-review.ts, update-review.ts + steps
      api/                               # moved: admin/reviews/, store/products/[id]/reviews/, store/reviews/
      links/                             # moved: review-product.ts
      admin/                             # moved: routes/reviews/
      index.ts
    package.json
    tsconfig.json

  plugin-loyalty/                        # same structure pattern
  plugin-invoices/                       # same structure pattern
  plugin-bundles/                        # same structure pattern
  plugin-subscription/                   # same structure pattern
  plugin-preorder/                       # same structure pattern
```

### Modified files

```
pnpm-workspace.yaml                     # update packages list
turbo.json                               # no change needed (glob patterns match)
package.json                             # update filter scripts
apps/backend/package.json                # add @calilean/plugin-* dependencies
apps/backend/medusa-config.js            # update resolve paths → plugin package names
```

---

## Task 0: Monorepo Shell Restructure

**Files:**
- Move: `backend/` → `apps/backend/`
- Move: `storefront/` → `apps/storefront/`
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json` (root)
- Modify: `.gitignore`

- [ ] **Step 1: Create feature branch**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git checkout -b feat/monorepo-restructure
```

- [ ] **Step 2: Create apps directory and move backend + storefront**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
mkdir -p apps
git mv backend apps/backend
git mv storefront apps/storefront
```

- [ ] **Step 3: Update pnpm-workspace.yaml**

Replace entire file with:

```yaml
packages:
  - "apps/**"
  - "packages/**"
  - "!apps/backend/.medusa/**"
```

- [ ] **Step 4: Update root package.json scripts**

Update the `scripts` and filter names. The backend package name is `medusa-2.0-boilerplate-backend` and the storefront is `medusa-next`:

```json
{
  "name": "calilean",
  "private": true,
  "packageManager": "pnpm@9.10.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "start": "turbo start",
    "lint": "turbo lint",
    "test": "turbo test",
    "backend:dev": "turbo dev --filter=medusa-2.0-boilerplate-backend",
    "storefront:dev": "turbo dev --filter=medusa-next"
  },
  "pnpm": {
    "overrides": {
      "fast-xml-parser": "5.5.8",
      "protobufjs": "7.5.5"
    }
  },
  "devDependencies": {
    "turbo": "^2.0.14"
  }
}
```

- [ ] **Step 5: Update root .gitignore if it has path-specific entries**

Check if `.gitignore` has any paths that reference `backend/` or `storefront/` directly. The existing `.gitignore` uses generic patterns (`node_modules`, `.env*`, `.next/`, `dist/`) so no changes needed unless there are specific paths. The only specific path is `docs/brand/imagery/renders/raw/*.png` which is unaffected.

- [ ] **Step 6: Create packages directory**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
mkdir -p packages
```

- [ ] **Step 7: Install dependencies to verify workspace resolves**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
pnpm install
```

Expected: pnpm resolves both `apps/backend` and `apps/storefront` as workspace packages. No errors.

- [ ] **Step 8: Verify backend builds**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
pnpm --filter medusa-2.0-boilerplate-backend build
```

Expected: Build succeeds. The `medusa build` command resolves paths relative to the package directory, so moving to `apps/backend/` should not break it.

- [ ] **Step 9: Verify storefront builds**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
pnpm --filter medusa-next build
```

Expected: Build succeeds. Next.js resolves paths relative to the package directory.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: restructure monorepo to apps/ layout

Move backend/ → apps/backend/ and storefront/ → apps/storefront/.
Update pnpm-workspace.yaml to apps/**/packages/** pattern.
No code changes — directory rename only."
```

---

## Task 1: Extract ShipStation Plugin (Provider)

**Files:**
- Create: `packages/plugin-shipstation/package.json`
- Create: `packages/plugin-shipstation/tsconfig.json`
- Create: `packages/plugin-shipstation/src/index.ts`
- Create: `packages/plugin-shipstation/src/providers/shipstation/index.ts`
- Move: `apps/backend/src/modules/shipstation/service.ts` → `packages/plugin-shipstation/src/providers/shipstation/service.ts`
- Move: `apps/backend/src/modules/shipstation/client.ts` → `packages/plugin-shipstation/src/providers/shipstation/client.ts`
- Move: `apps/backend/src/modules/shipstation/types.ts` → `packages/plugin-shipstation/src/providers/shipstation/types.ts`
- Delete: `apps/backend/src/modules/shipstation/` (empty after moves)
- Modify: `apps/backend/medusa-config.js`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Create plugin directory structure**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
mkdir -p packages/plugin-shipstation/src/providers/shipstation
```

- [ ] **Step 2: Create packages/plugin-shipstation/package.json**

```json
{
  "name": "@calilean/plugin-shipstation",
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

- [ ] **Step 3: Create packages/plugin-shipstation/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 4: Move ShipStation module files to plugin providers directory**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git mv apps/backend/src/modules/shipstation/service.ts packages/plugin-shipstation/src/providers/shipstation/service.ts
git mv apps/backend/src/modules/shipstation/client.ts packages/plugin-shipstation/src/providers/shipstation/client.ts
git mv apps/backend/src/modules/shipstation/types.ts packages/plugin-shipstation/src/providers/shipstation/types.ts
```

- [ ] **Step 5: Create packages/plugin-shipstation/src/providers/shipstation/index.ts**

This replaces the old `apps/backend/src/modules/shipstation/index.ts`. The content is identical — it's a ModuleProvider export:

```typescript
import ShipStationProviderService from "./service"
import {
  ModuleProvider,
  Modules
} from "@medusajs/framework/utils"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ShipStationProviderService],
})
```

- [ ] **Step 6: Create packages/plugin-shipstation/src/index.ts**

Plugin entry point — exports nothing for now (provider plugins don't need to export module constants):

```typescript
// @calilean/plugin-shipstation
// ShipStation fulfillment provider plugin
// Provider registered via medusa-config modules[] array
```

- [ ] **Step 7: Delete old shipstation module directory**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
rm apps/backend/src/modules/shipstation/index.ts
rmdir apps/backend/src/modules/shipstation
```

- [ ] **Step 8: Add @calilean/plugin-shipstation as workspace dependency in backend**

In `apps/backend/package.json`, add to `dependencies`:

```json
"@calilean/plugin-shipstation": "workspace:*"
```

- [ ] **Step 9: Update medusa-config.js — change ShipStation resolve path**

In `apps/backend/medusa-config.js`, find the fulfillment provider block (line ~138-156) and change the resolve path from `'./src/modules/shipstation'` to `'@calilean/plugin-shipstation/providers/shipstation'`:

Change:
```javascript
{
  resolve: './src/modules/shipstation',
  id: 'shipstation',
  options: {
    api_key: SHIPSTATION_API_KEY,
  },
},
```

To:
```javascript
{
  resolve: '@calilean/plugin-shipstation/providers/shipstation',
  id: 'shipstation',
  options: {
    api_key: SHIPSTATION_API_KEY,
  },
},
```

Also add `"@calilean/plugin-shipstation"` to the `plugins` array:
```javascript
plugins: [
  "@calilean/plugin-shipstation",
  ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY ? [{
    // existing meilisearch config
  }] : [])
]
```

- [ ] **Step 10: Install and verify**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
pnpm install
pnpm --filter medusa-2.0-boilerplate-backend build
```

Expected: Workspace resolves `@calilean/plugin-shipstation`. Build succeeds. Medusa finds the provider at the new path.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: extract ShipStation as @calilean/plugin-shipstation

Move fulfillment provider from backend/src/modules/shipstation/
to packages/plugin-shipstation/ as a Medusa v2 plugin.
Register via plugins[] + modules[] in medusa-config."
```

---

## Task 2: Extract MinIO Plugin (Provider)

**Files:**
- Create: `packages/plugin-minio/package.json`
- Create: `packages/plugin-minio/tsconfig.json`
- Create: `packages/plugin-minio/src/index.ts`
- Create: `packages/plugin-minio/src/providers/minio-file/index.ts`
- Move: `apps/backend/src/modules/minio-file/service.ts` → `packages/plugin-minio/src/providers/minio-file/service.ts`
- Move: `apps/backend/src/modules/minio-file/` (any migration files) → `packages/plugin-minio/src/providers/minio-file/`
- Delete: `apps/backend/src/modules/minio-file/`
- Modify: `apps/backend/medusa-config.js`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Create plugin directory structure**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
mkdir -p packages/plugin-minio/src/providers/minio-file
```

- [ ] **Step 2: Create packages/plugin-minio/package.json**

```json
{
  "name": "@calilean/plugin-minio",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "files": ["src"],
  "dependencies": {
    "minio": "^8.0.6"
  },
  "peerDependencies": {
    "@medusajs/framework": "2.14.1",
    "@medusajs/medusa": "2.14.1"
  }
}
```

Note: `minio` dependency moves from backend to this plugin since only this plugin uses it.

- [ ] **Step 3: Create packages/plugin-minio/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 4: Move MinIO module files**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
# Move all files from minio-file module to plugin
git mv apps/backend/src/modules/minio-file/service.ts packages/plugin-minio/src/providers/minio-file/service.ts
# Move index.ts (the ModuleProviderExports)
git mv apps/backend/src/modules/minio-file/index.ts packages/plugin-minio/src/providers/minio-file/index.ts
# Move any remaining files (migrations, etc.)
# Check what else exists first:
ls apps/backend/src/modules/minio-file/
# Move remaining files with git mv
```

- [ ] **Step 5: Create packages/plugin-minio/src/index.ts**

```typescript
// @calilean/plugin-minio
// MinIO S3-compatible file storage provider plugin
// Provider registered via medusa-config modules[] array
```

- [ ] **Step 6: Remove old minio-file directory**

```bash
rmdir apps/backend/src/modules/minio-file 2>/dev/null || rm -rf apps/backend/src/modules/minio-file
```

- [ ] **Step 7: Add workspace dependency and update config**

In `apps/backend/package.json`, add to dependencies:
```json
"@calilean/plugin-minio": "workspace:*"
```

Remove `"minio": "^8.0.6"` from backend's dependencies since it now lives in the plugin.

In `apps/backend/medusa-config.js`, change the file provider resolve from `'./src/modules/minio-file'` to `'@calilean/plugin-minio/providers/minio-file'`:

Change:
```javascript
resolve: './src/modules/minio-file',
```
To:
```javascript
resolve: '@calilean/plugin-minio/providers/minio-file',
```

Add `"@calilean/plugin-minio"` to the `plugins` array.

- [ ] **Step 8: Install and verify**

```bash
pnpm install
pnpm --filter medusa-2.0-boilerplate-backend build
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: extract MinIO as @calilean/plugin-minio

Move file provider from backend/src/modules/minio-file/
to packages/plugin-minio/. Move minio dependency to plugin."
```

---

## Task 3: Extract Email Plugin (Provider + Templates)

**Files:**
- Create: `packages/plugin-email/package.json`
- Create: `packages/plugin-email/tsconfig.json`
- Create: `packages/plugin-email/src/index.ts`
- Move: `apps/backend/src/modules/email-notifications/` → `packages/plugin-email/src/providers/email-notifications/`
- Modify: `apps/backend/medusa-config.js`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Create plugin directory**

```bash
mkdir -p packages/plugin-email/src/providers
```

- [ ] **Step 2: Create packages/plugin-email/package.json**

```json
{
  "name": "@calilean/plugin-email",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "files": ["src"],
  "dependencies": {
    "resend": "4.0.1",
    "@react-email/components": "^1.0.1"
  },
  "peerDependencies": {
    "@medusajs/framework": "2.14.1",
    "@medusajs/medusa": "2.14.1"
  }
}
```

- [ ] **Step 3: Create tsconfig.json (same pattern as Task 1 Step 3)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

Note: `jsx: "react-jsx"` needed because email templates use JSX.

- [ ] **Step 4: Move entire email-notifications module**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
git mv apps/backend/src/modules/email-notifications packages/plugin-email/src/providers/email-notifications
```

- [ ] **Step 5: Create packages/plugin-email/src/index.ts**

```typescript
// @calilean/plugin-email
// Resend notification provider with branded CaliLean email templates
// Provider registered via medusa-config modules[] array
```

- [ ] **Step 6: Add workspace dependency and update config**

In `apps/backend/package.json`:
- Add `"@calilean/plugin-email": "workspace:*"` to dependencies
- Remove `"resend": "4.0.1"` and `"@react-email/components": "^1.0.1"` from dependencies (moved to plugin)

In `apps/backend/medusa-config.js`, change:
```javascript
resolve: './src/modules/email-notifications',
```
To:
```javascript
resolve: '@calilean/plugin-email/providers/email-notifications',
```

Add `"@calilean/plugin-email"` to the `plugins` array.

Update the `email:dev` script in `apps/backend/package.json` to point to new template location:
```json
"email:dev": "email dev --dir=../../packages/plugin-email/src/providers/email-notifications/templates --port=3002"
```

- [ ] **Step 7: Install and verify**

```bash
pnpm install
pnpm --filter medusa-2.0-boilerplate-backend build
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: extract email as @calilean/plugin-email

Move Resend notification provider and branded templates from
backend/src/modules/email-notifications/ to packages/plugin-email/.
Move resend and react-email dependencies to plugin."
```

---

## Task 4: Extract Product Reviews Plugin (First Feature Plugin)

This is the first full feature plugin — it includes a module, workflows, API routes, links, and admin pages.

**Files:**
- Create: `packages/plugin-reviews/package.json`
- Create: `packages/plugin-reviews/tsconfig.json`
- Create: `packages/plugin-reviews/src/index.ts`
- Move: `apps/backend/src/modules/product-review/` → `packages/plugin-reviews/src/modules/product-review/`
- Move: `apps/backend/src/workflows/create-review.ts` → `packages/plugin-reviews/src/workflows/`
- Move: `apps/backend/src/workflows/update-review.ts` → `packages/plugin-reviews/src/workflows/`
- Move: `apps/backend/src/workflows/steps/create-review.ts` → `packages/plugin-reviews/src/workflows/steps/`
- Move: `apps/backend/src/workflows/steps/update-review-status.ts` → `packages/plugin-reviews/src/workflows/steps/`
- Move: `apps/backend/src/api/admin/reviews/` → `packages/plugin-reviews/src/api/admin/reviews/`
- Move: `apps/backend/src/api/store/products/[id]/reviews/` → `packages/plugin-reviews/src/api/store/products/[id]/reviews/`
- Move: `apps/backend/src/api/store/reviews/` → `packages/plugin-reviews/src/api/store/reviews/`
- Move: `apps/backend/src/links/review-product.ts` → `packages/plugin-reviews/src/links/`
- Move: `apps/backend/src/admin/routes/reviews/` → `packages/plugin-reviews/src/admin/routes/reviews/`
- Modify: `apps/backend/medusa-config.js`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Create plugin directory structure**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
mkdir -p packages/plugin-reviews/src/{modules,workflows/steps,api/admin,api/store/products/\[id\],api/store,links,admin/routes}
```

- [ ] **Step 2: Create packages/plugin-reviews/package.json**

```json
{
  "name": "@calilean/plugin-reviews",
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

- [ ] **Step 3: Create tsconfig.json (same as Task 1 Step 3, add jsx for admin)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 4: Move module**

```bash
git mv apps/backend/src/modules/product-review packages/plugin-reviews/src/modules/product-review
```

- [ ] **Step 5: Move workflows and steps**

```bash
git mv apps/backend/src/workflows/create-review.ts packages/plugin-reviews/src/workflows/
git mv apps/backend/src/workflows/update-review.ts packages/plugin-reviews/src/workflows/
git mv apps/backend/src/workflows/steps/create-review.ts packages/plugin-reviews/src/workflows/steps/
git mv apps/backend/src/workflows/steps/update-review-status.ts packages/plugin-reviews/src/workflows/steps/
```

- [ ] **Step 6: Move API routes**

```bash
git mv apps/backend/src/api/admin/reviews packages/plugin-reviews/src/api/admin/reviews
git mv apps/backend/src/api/store/products/\[id\]/reviews packages/plugin-reviews/src/api/store/products/\[id\]/reviews
git mv apps/backend/src/api/store/reviews packages/plugin-reviews/src/api/store/reviews
```

- [ ] **Step 7: Move links**

```bash
git mv apps/backend/src/links/review-product.ts packages/plugin-reviews/src/links/review-product.ts
```

- [ ] **Step 8: Move admin routes**

```bash
git mv apps/backend/src/admin/routes/reviews packages/plugin-reviews/src/admin/routes/reviews
```

- [ ] **Step 9: Fix import paths in moved files**

After moving files, relative imports that referenced `../../modules/product-review` from workflows or API routes need updating. Scan all moved files:

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
grep -r "modules/product-review" packages/plugin-reviews/src/
grep -r "\.\.\/.*modules" packages/plugin-reviews/src/
```

Update any relative imports to use the new relative paths within the plugin. For example, in `packages/plugin-reviews/src/workflows/create-review.ts`, change:
```typescript
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
```
To:
```typescript
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
```

- [ ] **Step 10: Create packages/plugin-reviews/src/index.ts**

```typescript
export { PRODUCT_REVIEW_MODULE } from "./modules/product-review"
```

- [ ] **Step 11: Update any remaining imports in apps/backend/src/**

Check if any code in `apps/backend/src/` imports from the product-review module:

```bash
grep -r "product-review\|PRODUCT_REVIEW_MODULE\|productReview" apps/backend/src/
```

If found, update those imports to use `@calilean/plugin-reviews`:
```typescript
import { PRODUCT_REVIEW_MODULE } from "@calilean/plugin-reviews"
```

- [ ] **Step 12: Update medusa-config.js**

Remove the product-review module from the `modules` array:
```javascript
// REMOVE this line:
{
  resolve: './src/modules/product-review',
},
```

Add `"@calilean/plugin-reviews"` to the `plugins` array.

- [ ] **Step 13: Add workspace dependency**

In `apps/backend/package.json`, add:
```json
"@calilean/plugin-reviews": "workspace:*"
```

- [ ] **Step 14: Install and verify**

```bash
pnpm install
pnpm --filter medusa-2.0-boilerplate-backend build
```

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: extract product reviews as @calilean/plugin-reviews

Move product-review module, workflows, API routes, links, and admin
pages to packages/plugin-reviews/ as a Medusa v2 plugin."
```

---

## Tasks 5-9: Remaining Feature Plugins

Tasks 5-9 follow the exact same pattern as Task 4. For each, the steps are:

1. Create plugin directory structure
2. Create `package.json` and `tsconfig.json`
3. Move module directory
4. Move related workflows + steps
5. Move related API routes
6. Move related links
7. Move related admin routes/widgets/hooks/components
8. Move related subscribers (if any)
9. Fix relative import paths within the plugin
10. Create `src/index.ts` exporting module constants
11. Update remaining imports in `apps/backend/src/`
12. Remove module from `medusa-config.js` modules array, add to plugins array
13. Add workspace dependency
14. Install and verify build
15. Commit

### Task 5: Extract Loyalty Plugin

**Moves:**
- Module: `apps/backend/src/modules/loyalty/` → `packages/plugin-loyalty/src/modules/loyalty/`
- Workflows: `apply-loyalty-on-cart.ts`, `remove-loyalty-from-cart.ts`, `handle-order-points.ts`
- Steps: `deduct-purchase-points.ts`, `add-purchase-points.ts`, `calculate-loyalty-points.ts`, `create-loyalty-promo.ts`, `remove-loyalty-promo.ts`
- Routes: `store/carts/[id]/loyalty-points/`, `store/customers/me/loyalty-points/`
- No links, no admin, no subscribers

**Special:** The `apply-first-purchase` subscriber in `apps/backend/src/subscribers/` references `LOYALTY_MODULE` — update its import to `@calilean/plugin-loyalty`.

**Export:** `LOYALTY_MODULE` from `src/index.ts`

**Plugin dependencies:** None beyond peer deps.

### Task 6: Extract Invoices Plugin

**Moves:**
- Module: `apps/backend/src/modules/invoice-generator/` (has loader: `create-default-config.ts`)
- Workflows: `generate-invoice-pdf.ts`, `update-invoice-config.ts`, `mark-invoices-stale.ts`
- Steps: `create-invoice.ts`, `generate-pdf.ts`, `update-invoice.ts`, `get-invoice-config.ts`, `update-invoice-config.ts`
- Routes: `admin/invoice-config/`, `admin/orders/[id]/invoices/`, `store/orders/[id]/invoices/`
- Admin: `routes/settings/invoice-config/`, `widgets/order-invoice.tsx`
- No links, no subscribers

**Plugin dependencies:** `"pdfmake": "^0.2.18"` moves from backend to this plugin.

**Export:** `INVOICE_MODULE` from `src/index.ts`

### Task 7: Extract Bundles Plugin

**Moves:**
- Module: `apps/backend/src/modules/bundled-product/`
- Workflows: `create-bundled-product.ts`, `add-bundle-to-cart.ts`, `remove-bundle-from-cart.ts`
- Steps: `create-bundle.ts`, `create-bundle-items.ts`, `add-bundle-items-to-cart.ts`, `remove-bundle-items-from-cart.ts`
- Routes: `admin/bundled-products/`, `store/bundle-products/[id]/`, `store/carts/[id]/line-item-bundles/`
- Links: `bundle-product.ts`, `bundle-item-product.ts`
- Admin: `routes/bundled-products/`, `components/create-bundled-product.tsx`
- No subscribers

**Export:** `BUNDLED_PRODUCT_MODULE` from `src/index.ts`

### Task 8: Extract Subscription Plugin

**Moves:**
- Module: `apps/backend/src/modules/subscription/`
- Workflows: `create-subscription/` (directory with index.ts + steps/), `create-subscription-order/` (directory with index.ts + steps/)
- Steps: all under the workflow directories
- Routes: `admin/subscriptions/`, `store/carts/[id]/subscribe/`, `store/customers/me/subscriptions/`
- Links: `subscription-customer.ts`, `subscription-order.ts`, `subscription-cart.ts`
- Admin: `routes/subscriptions/`
- No subscribers

**Plugin dependencies:** `"moment": "^2.30.1"` moves from backend to this plugin (subscription date calculations).

**Export:** `SUBSCRIPTION_MODULE` from `src/index.ts`

### Task 9: Extract Preorder Plugin

**Moves:**
- Module: `apps/backend/src/modules/preorder/`
- Workflows: `upsert-product-variant-preorder.ts`, `cancel-preorders.ts`, `disable-preorder-variant.ts`, `fulfill-preorder.ts`, `complete-cart-preorder.ts`
- Steps: `create-preorder.ts`, `update-preorder.ts`, `get-preorder.ts`, `fulfill-preorder-items.ts`, `cancel-preorder-items.ts`, `disable-preorder.ts`
- Routes: `admin/variants/[id]/preorders/`, `admin/orders/[id]/preorders/`, `store/carts/[id]/complete-preorder/`
- Links: `preorder-variant.ts`, `preorder-order.ts`
- Subscribers: `preorder-notification.ts`
- Admin: `widgets/preorder-widget.tsx`, `widgets/preorder-variant-widget.tsx`, `hooks/use-preorders.ts`, `hooks/use-preorder-variant.ts`

**Export:** `PREORDER_MODULE` from `src/index.ts`

**This is the most complex extraction** — has the most workflows, links, a subscriber, and admin widgets + hooks. Follow the same pattern but expect more import path fixups.

---

## Final Validation: Post-Phase-9 Checklist

After all 9 plugins are extracted, verify:

- [ ] **Step 1: Clean install**

```bash
cd /Users/mikebelloli/Development/projects-skafld/CaliLean
rm -rf node_modules apps/backend/node_modules apps/storefront/node_modules packages/*/node_modules
pnpm install
```

- [ ] **Step 2: Full build**

```bash
pnpm build
```

- [ ] **Step 3: Verify medusa-config.js has no remaining ./src/modules/* resolves**

```bash
grep -n "src/modules" apps/backend/medusa-config.js
```

Expected: No matches. All module resolves should reference `@calilean/plugin-*`.

- [ ] **Step 4: Verify no orphaned imports in apps/backend/src/**

```bash
grep -r "modules/loyalty\|modules/bundled-product\|modules/preorder\|modules/subscription\|modules/product-review\|modules/invoice-generator\|modules/shipstation\|modules/minio-file\|modules/email-notifications" apps/backend/src/
```

Expected: No matches. All imports should use `@calilean/plugin-*`.

- [ ] **Step 5: Verify apps/backend/src/modules/ is empty**

```bash
ls apps/backend/src/modules/
```

Expected: Empty directory (or can be deleted).

- [ ] **Step 6: Start backend and verify**

```bash
cd apps/backend
pnpm dev
```

Expected: Medusa starts, all plugins load, admin dashboard accessible at localhost:9000/app.

- [ ] **Step 7: Commit final cleanup if needed**

```bash
git add -A
git commit -m "chore: complete plugin extraction — verify all 9 plugins load"
```
