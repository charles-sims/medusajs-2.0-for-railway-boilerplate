# Medusa 2.13.6 → 2.14.1 Upgrade Design

**Goal:** Upgrade CaliLean from Medusa 2.13.6 to 2.14.1, add pnpm workspace + Turborepo, pin all floating deps, migrate Zod v3 → v4, evaluate custom modules against official packages, and establish an upstream tracking workflow.

**Current state:**
- Backend + storefront: Medusa 2.13.6
- 128 commits ahead, 0 behind rpuls template (also 2.13.6)
- 8 custom modules (none in production use) — pulled from official examples but reworked for 2.13.6
- 18 CaliLean-specific storefront components, MDX research pipeline, custom auth flow
- Storefront `@medusajs/*` deps on floating `preview` tag
- No pnpm workspace or Turborepo orchestration

**Target state:**
- All `@medusajs/*` at pinned `2.14.1`
- pnpm 10.x workspace with Turborepo
- Zod v4 throughout
- Custom modules replaced with official where possible
- `medusa` remote added for dtc-starter tracking
- Zero Railway config changes

---

## 1. Workspace Setup

Add 3 files to repo root — no directory moves, Railway stays unchanged.

### `pnpm-workspace.yaml`
```yaml
packages:
  - "backend"
  - "storefront"
  - "!backend/.medusa/**"
```

### `turbo.json`
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

### Root `package.json`
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

Remove `packageManager` field from `backend/package.json` and `storefront/package.json` (root owns this now).

---

## 2. Backend Version Bump

In `backend/package.json`, bump all `@medusajs/*` dependencies:

**dependencies:**
| Package | From | To |
|---------|------|----|
| `@medusajs/admin-sdk` | `2.13.6` | `2.14.1` |
| `@medusajs/admin-shared` | `2.13.6` | `2.14.1` |
| `@medusajs/cli` | `2.13.6` | `2.14.1` |
| `@medusajs/dashboard` | `2.13.6` | `2.14.1` |
| `@medusajs/draft-order` | `2.13.6` | `2.14.1` |
| `@medusajs/framework` | `2.13.6` | `2.14.1` |
| `@medusajs/icons` | `2.13.6` | `2.14.1` |
| `@medusajs/js-sdk` | `^2.14.1` | `2.14.1` |
| `@medusajs/medusa` | `2.13.6` | `2.14.1` |
| `@medusajs/notification-sendgrid` | `2.13.6` | `2.14.1` |
| `@medusajs/payment-stripe` | `2.13.6` | `2.14.1` |
| `@medusajs/ui` | `4.1.6` | `4.1.8` |
| `@medusajs/workflow-engine-redis` | `2.13.6` | `2.14.1` |
| `zod` (new) | — | `4.2.0` |

**devDependencies:**
| Package | From | To |
|---------|------|----|
| `@medusajs/orchestration` | `^2.14.1` | `2.14.1` |
| `@medusajs/test-utils` | `2.13.6` | `2.14.1` |

After bumping: `pnpm install` then `medusa db:migrate`.

---

## 3. Storefront Version Pinning

Pin all floating `preview` tags to `2.14.1`:

**dependencies:**
| Package | From | To |
|---------|------|----|
| `@medusajs/icons` | `2.13.6` | `2.14.1` |
| `@medusajs/js-sdk` | `preview` | `2.14.1` |
| `@medusajs/types` | `preview` | `2.14.1` |
| `@medusajs/ui` | `preview` | `2.14.1` |

**devDependencies:**
| Package | From | To |
|---------|------|----|
| `@medusajs/client-types` | `preview` | Remove (verify merged into `@medusajs/types`) |
| `@medusajs/ui-preset` | `preview` | `2.14.1` |

Keep current Next.js (`^15.5.15`), React (`19.0.4`), and all other storefront deps as-is.

---

## 4. Zod v3 → v4 Migration

Scan all custom backend code (`src/`) for Zod usage and migrate per Medusa's official guide:

**Key changes:**
- `z.string().email()` → `z.email()`
- `z.string().url()` → `z.url()`
- `z.string().uuid()` → `z.uuid()`
- `z.record(valueSchema)` → `z.record(z.string(), valueSchema)`
- `z.nativeEnum(MyEnum)` → `z.enum(MyEnum)`
- `invalid_type_error`/`required_error` → unified `error` param
- `.strict()` → `z.strictObject()`
- `.passthrough()` → `z.looseObject()`

**Files to scan:**
- `src/api/` — custom API route validators
- `src/admin/` — admin form schemas
- `src/workflows/` — workflow step validators
- `src/modules/` — module service validators

After migration: `medusa build` to verify TypeScript compilation.

---

## 5. Custom Module Evaluation

8 custom modules, none in production. Evaluate case-by-case:

| Module | Strategy | Notes |
|--------|----------|-------|
| `loyalty` | **Replace with official** | Medusa 2.14.0 open-sourced Loyalty plugin |
| `bundled-product` | Check for official → replace or upgrade | |
| `invoice-generator` | Check for official → replace or upgrade | |
| `preorder` | Check for official → replace or upgrade | |
| `product-review` | Check for official → replace or upgrade | |
| `subscription` | Check for official → replace or upgrade | |
| `shipstation` | **Upgrade in-place** | Custom fulfillment provider |
| `email-notifications` | **Keep as-is** | rpuls template, Resend integration |
| `minio-file` | **Keep as-is** | rpuls template, file storage |

For modules kept or upgraded in-place: fix Zod usage, verify 2.14.1 framework API compatibility.

Replaced modules: remove custom code, install official package, update `medusa-config.js` to reference the official module, run `medusa db:migrate`.

---

## 6. Upstream Tracking Workflow

Manual process for ongoing maintenance:

1. **Add `medusa` remote:**
   ```bash
   git remote add medusa https://github.com/medusajs/dtc-starter.git
   ```

2. **Check for updates:**
   ```bash
   git fetch medusa
   git log medusa/main --oneline -10
   ```

3. **Compare versions:**
   ```bash
   git show medusa/main:apps/backend/package.json | grep medusajs
   ```

4. **Diff storefront data layer for new helpers:**
   ```bash
   # dtc-starter uses apps/storefront/, we use storefront/
   # Fetch the file list and compare manually:
   git show medusa/main:apps/storefront/src/lib/data/ | sort > /tmp/dtc-data-files.txt
   ls storefront/src/lib/data/ | sort > /tmp/our-data-files.txt
   diff /tmp/dtc-data-files.txt /tmp/our-data-files.txt
   ```

5. **Keep `upstream` remote** (rpuls template) for Railway-specific patterns.

---

## What stays unchanged

- **Directory structure:** `backend/` + `storefront/` — no moves
- **Railway config:** Service root directories, nixpacks, env vars — all unchanged
- **All CaliLean customizations:** Brand, auth gate, research pages, MDX pipeline, 18 custom components, 15 MDX files, molecular structure SVGs
- **medusa-config.js:** Same conditional module loading (MinIO, Stripe, SendGrid/Resend, MeiliSearch, ShipStation) — just verify imports still work with 2.14.1
- **Database:** `medusa db:migrate` handles schema changes automatically

## Risk assessment

- **Low risk:** Version bump is 1 minor version. Zod migration is mechanical. No production modules to break.
- **Medium risk area:** Zod v4 in custom admin routes/forms — need thorough scan.
- **Rollback:** Git revert to pre-upgrade commit + `pnpm install` + `medusa db:migrate` (migrations are forward-only, but 1 minor version rollback is safe).
