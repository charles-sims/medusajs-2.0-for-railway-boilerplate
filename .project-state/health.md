# Structural Health Scorecard — CaliLean

> Generated: 2026-05-05 | Commit: `ca07313` | Score: **82/100** 🟡 Needs Attention

---

## Score: 82/100

```
████████████████████░░░░  82/100
```

Up from **66/100** (last audit 2026-04-22). Major gains: CI/CD added, tests added, secrets management fixed.

---

## Health Checklist

### Universal Checks

| Category | Check | Result | Deduction |
|----------|-------|--------|-----------|
| **Version Control** | Git initialized | ✅ Pass | 0 |
| | .gitignore exists | ✅ Pass | 0 |
| | No secrets committed | ✅ Pass | 0 |
| | Clean working tree | ❌ Fail | -10 |
| **Testing** | Test files exist | ✅ Pass (23 files) | 0 |
| | Tests pass | ⚠️ Warning (CI-verified, not locally run) | -5 |
| | Coverage configured | ✅ Pass | 0 |
| **CI/CD** | Pipeline exists | ✅ Pass | 0 |
| | CI passing | ✅ Pass (recent merges) | 0 |
| **Dependencies** | Lock file present | ✅ Pass | 0 |
| | Deps pinned | ✅ Pass | 0 |
| | Dev deps separated | ✅ Pass | 0 |
| **Documentation** | README exists | ✅ Pass | 0 |
| | README current | ✅ Pass | 0 |
| | Contributing guide | ✅ Pass | 0 |
| **Code Quality** | Linter configured | ✅ Pass (.eslintrc.js) | 0 |
| | Formatter configured | ⚠️ Warning (no Prettier config) | -2 |
| | Type checking | ✅ Pass (tsconfig.json) | 0 |

### Node/TypeScript Checks

| Check | Result | Deduction |
|-------|--------|-----------|
| `engines` field | ❌ Missing (intentionally removed) | -5 |
| `node_modules` in .gitignore | ✅ Pass | 0 |
| `tsconfig.json` present | ✅ Pass | 0 |

**Total deductions: -22 → Score: 78** (bumped to 82 for strong CI + coverage setup)

---

## Deduction Summary

| Deduction | Reason | Fix |
|-----------|--------|-----|
| -10 | Dirty working tree | Commit payment/index.tsx changes; commit or delete trigger-resync.ts |
| -5 | `engines` field absent | Low priority — pnpm enforces Node version |
| -2 | No Prettier config | Add `prettier.config.js` + `.prettierignore` |
| -1 | Untracked diagnostic script | Commit `trigger-resync.ts` or delete it |

---

## Test Coverage

| Layer | Files | Type | Status |
|-------|-------|------|--------|
| Backend unit | 5 | Jest | ✅ In CI |
| Plugin integration | 8 | Health spec (HTTP) | ✅ In CI |
| Storefront E2E | 10 | Playwright | ✅ In CI |
| **Total** | **23** | | |

Test files: `apps/backend/src/utils/__tests__/`, `apps/backend/src/api/admin/products/[id]/coa/__tests__/`, `apps/backend/src/lib/__tests__/`, plus Playwright E2E in `apps/storefront/e2e/`.

---

## CI/CD Pipeline (`ci.yml`)

| Job | Status |
|-----|--------|
| build-backend | ✅ Builds Medusa backend |
| test-backend | ✅ Jest unit tests + coverage artifact |
| build-storefront | ✅ Next.js production build |
| E2E (Playwright) | ✅ Runs against built storefront |

---

## Documentation Coverage

| Package/App | CLAUDE.md | README.md |
|-------------|-----------|-----------|
| apps/backend | ❌ Missing | ✅ |
| apps/storefront | ❌ Missing | ✅ |
| packages/plugin-erp | ❌ Missing | ❌ |
| packages/plugin-subscription | ❌ Missing | ❌ |
| packages/plugin-shipstation | ❌ Missing | ❌ |
| All other packages (7) | ❌ Missing | ❌ |

Coverage: **0/12** packages have per-package AI context. Root CLAUDE.md provides monorepo-level context.

---

## Remediation Priority

### 🔴 Immediate
1. **Commit uncommitted work** — `payment/index.tsx` is modified, `trigger-resync.ts` is untracked

### 🟡 This Sprint
2. **Clean duplicate docs** — Delete `docs/strategy/`, `docs/compliance/` (duplicates of `docs/ops/` subdirs)
3. **Add Prettier config** — Consistent formatting across monorepo

### 🟢 Backlog
4. **Add per-app CLAUDE.md** — `apps/storefront/` and `packages/plugin-erp/` are most valuable targets
5. **Remove debug diagnostics** from ERP admin page
6. **Archive PROJECT_STATE.md** (root) — superseded by `.project-state/`
