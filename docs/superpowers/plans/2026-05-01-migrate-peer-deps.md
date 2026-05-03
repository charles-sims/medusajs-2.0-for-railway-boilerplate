# Migrate React Query and React to Peer Dependencies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `@tanstack/react-query`, `react`, and `react-dom` from `devDependencies` to `peerDependencies` in multiple plugin packages to prevent multiple instance bundling issues in Medusa Admin.

**Architecture:** Update `package.json` files to correctly categorize shared frontend libraries as peer dependencies, ensuring they are provided by the host environment (Medusa Admin) rather than being bundled multiple times.

**Tech Stack:** pnpm, React, TanStack Query

---

### Task 1: Update packages/plugin-bundles/package.json

**Files:**
- Modify: `packages/plugin-bundles/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

```json
{
  "devDependencies": {
    ...
    "@medusajs/ui": "4.1.8",
    "@swc/core": "^1.7.28",
    "@types/node": "^20.0.0",
    ...
  },
  "peerDependencies": {
    "@medusajs/framework": "2.14.1",
    "@medusajs/medusa": "2.14.1",
    "@tanstack/react-query": "^5.100.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### Task 2: Update packages/plugin-erp/package.json

**Files:**
- Modify: `packages/plugin-erp/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

### Task 3: Update packages/plugin-invoices/package.json

**Files:**
- Modify: `packages/plugin-invoices/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

### Task 4: Update packages/plugin-preorder/package.json

**Files:**
- Modify: `packages/plugin-preorder/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

### Task 5: Update packages/plugin-qr-marketing/package.json

**Files:**
- Modify: `packages/plugin-qr-marketing/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

### Task 6: Update packages/plugin-reviews/package.json

**Files:**
- Modify: `packages/plugin-reviews/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

### Task 7: Update packages/plugin-subscription/package.json

**Files:**
- Modify: `packages/plugin-subscription/package.json`

- [ ] **Step 1: Move dependencies to peerDependencies**

### Task 8: Update Lockfile

- [ ] **Step 1: Run pnpm install from root**

Run: `pnpm install`
Expected: Lockfile updated, no errors.
