# Medusa Admin QueryClient Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix "No QueryClient set" error in Medusa Admin by moving `react`, `react-dom`, and `@tanstack/react-query` to `peerDependencies` in all plugins.

**Architecture:** Plugins must not bundle their own React or React Query instances. By moving these to `peerDependencies`, they will use the versions provided by the host application (Medusa Admin).

**Tech Stack:** Node.js, pnpm, Medusa 2.0

---

### Task 1: Update plugin-subscription

**Files:**
- Modify: `packages/plugin-subscription/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 2: Update plugin-reviews

**Files:**
- Modify: `packages/plugin-reviews/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 3: Update plugin-qr-marketing

**Files:**
- Modify: `packages/plugin-qr-marketing/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 4: Update plugin-preorder

**Files:**
- Modify: `packages/plugin-preorder/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 5: Update plugin-invoices

**Files:**
- Modify: `packages/plugin-invoices/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 6: Update plugin-erp

**Files:**
- Modify: `packages/plugin-erp/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 7: Update plugin-bundles

**Files:**
- Modify: `packages/plugin-bundles/package.json`

- [ ] **Step 1: Update peerDependencies versions**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 8: Update plugin-loyalty

**Files:**
- Modify: `packages/plugin-loyalty/package.json`

- [ ] **Step 1: Add peerDependencies**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 9: Update plugin-shipstation

**Files:**
- Modify: `packages/plugin-shipstation/package.json`

- [ ] **Step 1: Add peerDependencies**
- [ ] **Step 2: Ensure removed from dependencies and devDependencies**

### Task 10: Update plugin-email

**Files:**
- Modify: `packages/plugin-email/package.json`

- [ ] **Step 1: Remove from dependencies**
- [ ] **Step 2: Remove from devDependencies**
- [ ] **Step 3: Add/Update peerDependencies**

### Task 11: Finalize Workspace

- [ ] **Step 1: Run pnpm install**
- [ ] **Step 2: Verify build in backend**
