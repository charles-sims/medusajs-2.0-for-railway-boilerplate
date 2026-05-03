# ERP Integration Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@calilean/plugin-erp` — a Medusa v2 plugin that syncs commerce data to QuickBooks Online and ERPNext via a provider-based architecture, with a custom dispute tracking module.

**Architecture:** Single plugin package with two modules (ERP core + Dispute), two providers (QBO + ERPNext), event subscribers, sync workflows with compensation, OAuth2 token management, webhook/admin API routes, and scheduled jobs. Follows the same patterns as existing `@calilean/plugin-invoices` and `@calilean/plugin-shipstation`.

**Tech Stack:** TypeScript, Medusa v2.14.1, `intuit-oauth` (QBO OAuth2), `node-quickbooks` or raw fetch (QBO API), `frappe-js-sdk` or raw fetch (ERPNext API), Node `crypto` (token encryption).

**Spec:** `docs/superpowers/specs/2026-05-02-erp-integration-design.md`

---

## File Structure

```
packages/plugin-erp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                              # Plugin entry — exports module constants
│   ├── modules/
│   │   ├── erp/
│   │   │   ├── index.ts                      # Module(ERP_MODULE, { service, loaders })
│   │   │   ├── service.ts                    # ErpModuleService extends MedusaService
│   │   │   ├── models/
│   │   │   │   └── erp-connection.ts         # ErpConnection data model
│   │   │   ├── migrations/                   # Auto-generated
│   │   │   ├── loaders/
│   │   │   │   └── initialize-providers.ts   # Loader to register providers on boot
│   │   │   └── types.ts                      # IErpProvider interface + types
│   │   └── dispute/
│   │       ├── index.ts                      # Module(DISPUTE_MODULE, { service })
│   │       ├── service.ts                    # DisputeModuleService extends MedusaService
│   │       ├── models/
│   │       │   └── dispute.ts                # Dispute data model
│   │       └── migrations/                   # Auto-generated
│   ├── providers/
│   │   ├── quickbooks/
│   │   │   ├── index.ts                      # Provider registration
│   │   │   ├── service.ts                    # QboErpProviderService implements IErpProvider
│   │   │   ├── client.ts                     # QBO REST API client
│   │   │   ├── mappers.ts                    # Medusa → QBO entity transforms
│   │   │   └── types.ts                      # QBO-specific API types
│   │   └── erpnext/
│   │       ├── index.ts                      # Provider registration
│   │       ├── service.ts                    # ErpNextProviderService implements IErpProvider
│   │       ├── client.ts                     # ERPNext REST API client
│   │       ├── mappers.ts                    # Medusa → ERPNext entity transforms
│   │       └── types.ts                      # ERPNext-specific API types
│   ├── workflows/
│   │   ├── index.ts                          # Re-export all workflows
│   │   ├── sync-order-to-erp.ts              # Order sync workflow
│   │   ├── sync-order-changes-to-erp.ts      # Order changes (fulfillment, returns, etc.)
│   │   ├── sync-payment-to-erp.ts            # Payment capture/refund sync
│   │   ├── sync-customer-to-erp.ts           # Customer CRUD sync
│   │   ├── sync-product-to-erp.ts            # Product CRUD sync
│   │   ├── sync-dispute-to-erp.ts            # Dispute sync workflow
│   │   ├── create-dispute.ts                 # Create dispute record in Medusa
│   │   ├── update-dispute.ts                 # Update dispute status
│   │   ├── pull-inventory-from-erp.ts        # Pull inventory levels
│   │   └── steps/
│   │       ├── sync-to-erp-providers.ts      # Core step: iterate providers, sync entity
│   │       ├── create-dispute-record.ts      # Step: create dispute in DB
│   │       ├── update-dispute-record.ts      # Step: update dispute in DB
│   │       └── update-inventory-levels.ts    # Step: update Medusa variant stock
│   ├── subscribers/
│   │   ├── erp-order-sync.ts                 # order.placed, order.canceled, order.completed
│   │   ├── erp-order-changes-sync.ts         # fulfillment, return, claim, exchange, edit events
│   │   ├── erp-payment-sync.ts               # payment.captured, payment.refunded
│   │   ├── erp-customer-sync.ts              # customer.created, customer.updated, customer.deleted
│   │   ├── erp-product-sync.ts               # product.created, product.updated
│   │   └── erp-dispute-sync.ts               # dispute.created, dispute.won, dispute.lost
│   ├── links/
│   │   ├── dispute-order.ts                  # Dispute ↔ Order
│   │   └── dispute-payment.ts                # Dispute ↔ Payment
│   ├── api/
│   │   ├── middlewares.ts                    # preserveRawBody for webhook routes
│   │   ├── erp/
│   │   │   ├── disputes/
│   │   │   │   └── webhook/
│   │   │   │       └── [provider_id]/
│   │   │   │           └── route.ts          # POST dispute webhook
│   │   │   ├── inventory/
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts              # POST inventory webhook
│   │   │   └── order-updates/
│   │   │       └── route.ts                  # POST order updates webhook
│   │   └── admin/
│   │       ├── erp/
│   │       │   ├── sync-status/
│   │       │   │   └── route.ts              # GET sync status
│   │       │   ├── resync/
│   │       │   │   └── route.ts              # POST manual resync
│   │       │   ├── connect/
│   │       │   │   └── [provider_id]/
│   │       │   │       ├── route.ts          # GET OAuth redirect
│   │       │   │       └── callback/
│   │       │   │           └── route.ts      # GET OAuth callback
│   │       │   └── disconnect/
│   │       │       └── [provider_id]/
│   │       │           └── route.ts          # POST disconnect
│   │       └── disputes/
│   │           ├── route.ts                  # GET list, POST create
│   │           └── [id]/
│   │               └── route.ts              # GET detail, POST update
│   └── jobs/
│       ├── qbo-token-refresh.ts              # Every 50 min
│       ├── erp-inventory-pull.ts             # Hourly
│       └── erp-reconciliation.ts             # Daily midnight
```

---

## Phase 1: Plugin Scaffold & Core Module

### Task 1: Initialize plugin package

**Files:**
- Create: `packages/plugin-erp/package.json`
- Create: `packages/plugin-erp/tsconfig.json`
- Create: `packages/plugin-erp/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@calilean/plugin-erp",
  "version": "0.1.0",
  "private": true,
  "description": "ERP integration plugin for CaliLean — QuickBooks Online and ERPNext sync",
  "files": [
    ".medusa/server"
  ],
  "exports": {
    "./package.json": "./package.json",
    "./workflows": "./.medusa/server/src/workflows/index.js",
    "./.medusa/server/src/modules/*": "./.medusa/server/src/modules/*/index.js",
    "./modules/*": "./.medusa/server/src/modules/*/index.js",
    "./providers/*": "./.medusa/server/src/providers/*/index.js",
    "./*": "./.medusa/server/src/*.js",
    "./admin": {
      "import": "./.medusa/server/src/admin/index.mjs",
      "require": "./.medusa/server/src/admin/index.js",
      "default": "./.medusa/server/src/admin/index.js"
    }
  },
  "scripts": {
    "build": "medusa plugin:build",
    "dev": "medusa plugin:develop",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest --passWithNoTests",
    "test:integration": "TEST_TYPE=integration:http jest --runInBand",
    "test:unit": "TEST_TYPE=unit jest",
    "prepublishOnly": "medusa plugin:build"
  },
  "dependencies": {
    "intuit-oauth": "^4.1.0"
  },
  "devDependencies": {
    "@medusajs/admin-sdk": "2.14.1",
    "@medusajs/admin-shared": "2.14.1",
    "@medusajs/cli": "2.14.1",
    "@medusajs/framework": "2.14.1",
    "@medusajs/icons": "2.14.1",
    "@medusajs/js-sdk": "2.14.1",
    "@medusajs/medusa": "2.14.1",
    "@medusajs/test-utils": "2.14.1",
    "@medusajs/ui": "4.1.8",
    "@tanstack/react-query": "^5.100.5",
    "@swc/core": "^1.7.28",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.2.25",
    "prop-types": "^15.8.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.74.0",
    "react-router-dom": "^6.30.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.2",
    "vite": "^5.2.11"
  },
  "peerDependencies": {
    "@medusajs/framework": "2.14.1",
    "@medusajs/medusa": "2.14.1"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["es2021"],
    "target": "ES2021",
    "outDir": "./.medusa/server",
    "rootDir": "./",
    "esModuleInterop": true,
    "declaration": true,
    "module": "Node16",
    "moduleResolution": "Node16",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "sourceMap": false,
    "noEmit": false,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "ts-node": {
    "swc": true
  },
  "include": [
    "src",
    ".medusa/types/*"
  ],
  "exclude": [
    "node_modules",
    ".medusa/server",
    ".medusa/admin",
    "src/admin",
    ".cache"
  ]
}
```

- [ ] **Step 3: Create src/index.ts**

```ts
export { ERP_MODULE } from "./modules/erp"
export { DISPUTE_MODULE } from "./modules/dispute"
```

- [ ] **Step 4: Install dependencies**

Run: `cd packages/plugin-erp && pnpm install`

- [ ] **Step 5: Commit**

```bash
git add packages/plugin-erp/package.json packages/plugin-erp/tsconfig.json packages/plugin-erp/src/index.ts
git commit -m "feat(plugin-erp): scaffold plugin package"
```

---

### Task 2: ERP module — types and provider interface

**Files:**
- Create: `packages/plugin-erp/src/modules/erp/types.ts`

- [ ] **Step 1: Create IErpProvider interface and types**

```ts
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export type ConnectionStatus = {
  connected: boolean
  provider_id: string
  last_sync_at: string | null
  token_expires_at: string | null
  realm_id: string | null
}

export type ErpInventoryLevel = {
  sku: string
  quantity: number
  location_id?: string
}

export type SyncResult = {
  external_id: string
  provider_id: string
}

export interface IErpProvider {
  identifier: string

  // Connection
  isConnected(): Promise<boolean>
  getConnectionStatus(): Promise<ConnectionStatus>

  // Orders
  createSalesReceipt(order: OrderDTO): Promise<string>
  voidSalesReceipt(externalId: string): Promise<void>
  updateOrderStatus(externalId: string, status: string): Promise<void>

  // Payments
  recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string>
  recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string>

  // Customers
  createCustomer(customer: CustomerDTO): Promise<string>
  updateCustomer(externalId: string, customer: CustomerDTO): Promise<void>
  deactivateCustomer(externalId: string): Promise<void>

  // Products
  createItem(product: { id: string; title: string; variants: any[]; metadata?: Record<string, unknown> }): Promise<string>
  updateItem(externalId: string, product: { id: string; title: string; variants: any[]; metadata?: Record<string, unknown> }): Promise<void>

  // Disputes
  createDisputeRefundReceipt(dispute: {
    id: string
    amount: number
    currency_code: string
    order_external_id: string
    customer_external_id?: string
    reason: string
  }): Promise<string>
  voidDisputeRefundReceipt(externalId: string): Promise<void>

  // Returns & Exchanges
  createCreditMemo(orderExternalId: string, items: { title: string; quantity: number; unit_price: number }[], amount: number, currencyCode: string): Promise<string>

  // Inventory (pull)
  getInventoryLevels(): Promise<ErpInventoryLevel[]>
}

export type ErpModuleOptions = {
  encryption_key?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/plugin-erp/src/modules/erp/types.ts
git commit -m "feat(plugin-erp): define IErpProvider interface and types"
```

---

### Task 3: ERP module — ErpConnection data model

**Files:**
- Create: `packages/plugin-erp/src/modules/erp/models/erp-connection.ts`

- [ ] **Step 1: Create ErpConnection model**

```ts
import { model } from "@medusajs/framework/utils"

const ErpConnection = model.define("erp_connection", {
  id: model.id().primaryKey(),
  provider_id: model.text(),
  access_token: model.text().default(""),
  refresh_token: model.text().default(""),
  token_expires_at: model.dateTime().nullable(),
  realm_id: model.text().nullable(),
  api_url: model.text().nullable(),
  is_connected: model.boolean().default(false),
  last_sync_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default ErpConnection
```

- [ ] **Step 2: Commit**

```bash
git add packages/plugin-erp/src/modules/erp/models/erp-connection.ts
git commit -m "feat(plugin-erp): add ErpConnection data model"
```

---

### Task 4: ERP module — service with encryption helpers

**Files:**
- Create: `packages/plugin-erp/src/modules/erp/service.ts`
- Create: `packages/plugin-erp/src/modules/erp/index.ts`

- [ ] **Step 1: Create ErpModuleService**

```ts
import { MedusaService } from "@medusajs/framework/utils"
import ErpConnection from "./models/erp-connection"
import { IErpProvider, ErpModuleOptions } from "./types"
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

class ErpModuleService extends MedusaService({
  ErpConnection,
}) {
  private providers_: Map<string, IErpProvider> = new Map()
  private encryptionKey_: string | null

  constructor(container: Record<string, unknown>, options: ErpModuleOptions) {
    super(...arguments)
    this.encryptionKey_ = (options?.encryption_key || process.env.ERP_ENCRYPTION_KEY) ?? null
  }

  registerProvider(provider: IErpProvider): void {
    this.providers_.set(provider.identifier, provider)
  }

  getProvider(providerId: string): IErpProvider {
    const provider = this.providers_.get(providerId)
    if (!provider) {
      throw new Error(`ERP provider "${providerId}" is not registered`)
    }
    return provider
  }

  getAllProviders(): IErpProvider[] {
    return Array.from(this.providers_.values())
  }

  encrypt(text: string): string {
    if (!this.encryptionKey_) {
      return text
    }
    const key = Buffer.from(this.encryptionKey_, "hex")
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    const authTag = cipher.getAuthTag()
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
  }

  decrypt(encryptedText: string): string {
    if (!this.encryptionKey_) {
      return encryptedText
    }
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      return encryptedText
    }
    const key = Buffer.from(this.encryptionKey_, "hex")
    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(parts[2], "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  }

  async getConnection(providerId: string): Promise<any | null> {
    const connections = await this.listErpConnections({
      provider_id: providerId,
    })
    const conn = connections[0] ?? null
    if (conn && conn.access_token) {
      conn.access_token = this.decrypt(conn.access_token)
    }
    if (conn && conn.refresh_token) {
      conn.refresh_token = this.decrypt(conn.refresh_token)
    }
    return conn
  }

  async upsertConnection(data: {
    provider_id: string
    access_token?: string
    refresh_token?: string
    token_expires_at?: Date
    realm_id?: string
    api_url?: string
    is_connected?: boolean
    last_sync_at?: Date
    metadata?: Record<string, unknown>
  }): Promise<any> {
    const existing = await this.getConnection(data.provider_id)

    const toSave = { ...data }
    if (toSave.access_token) {
      toSave.access_token = this.encrypt(toSave.access_token)
    }
    if (toSave.refresh_token) {
      toSave.refresh_token = this.encrypt(toSave.refresh_token)
    }

    if (existing) {
      return this.updateErpConnections({
        id: existing.id,
        ...toSave,
      })
    }

    return this.createErpConnections(toSave)
  }
}

export default ErpModuleService
```

- [ ] **Step 2: Create module index.ts**

```ts
import { Module } from "@medusajs/framework/utils"
import ErpModuleService from "./service"

export const ERP_MODULE = "erp"

export default Module(ERP_MODULE, {
  service: ErpModuleService,
})
```

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-erp/src/modules/erp/service.ts packages/plugin-erp/src/modules/erp/index.ts
git commit -m "feat(plugin-erp): add ErpModuleService with encryption and provider registry"
```

---

### Task 5: Dispute module — model, service, and links

**Files:**
- Create: `packages/plugin-erp/src/modules/dispute/models/dispute.ts`
- Create: `packages/plugin-erp/src/modules/dispute/service.ts`
- Create: `packages/plugin-erp/src/modules/dispute/index.ts`
- Create: `packages/plugin-erp/src/links/dispute-order.ts`
- Create: `packages/plugin-erp/src/links/dispute-payment.ts`

- [ ] **Step 1: Create Dispute data model**

```ts
import { model } from "@medusajs/framework/utils"

const Dispute = model.define("dispute", {
  id: model.id().primaryKey(),
  status: model.enum(["open", "under_review", "won", "lost"]).default("open"),
  reason: model.text(),
  amount: model.bigNumber(),
  currency_code: model.text(),
  provider_dispute_id: model.text(),
  payment_provider: model.text(),
  evidence_submitted: model.boolean().default(false),
  resolved_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default Dispute
```

- [ ] **Step 2: Create DisputeModuleService**

```ts
import { MedusaService } from "@medusajs/framework/utils"
import Dispute from "./models/dispute"

class DisputeModuleService extends MedusaService({
  Dispute,
}) {}

export default DisputeModuleService
```

- [ ] **Step 3: Create dispute module index.ts**

```ts
import { Module } from "@medusajs/framework/utils"
import DisputeModuleService from "./service"

export const DISPUTE_MODULE = "dispute"

export default Module(DISPUTE_MODULE, {
  service: DisputeModuleService,
})
```

- [ ] **Step 4: Create dispute-order link**

```ts
import { defineLink } from "@medusajs/framework/utils"
import DisputeModule from "../modules/dispute"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  DisputeModule.linkable.dispute,
  OrderModule.linkable.order
)
```

- [ ] **Step 5: Create dispute-payment link**

```ts
import { defineLink } from "@medusajs/framework/utils"
import DisputeModule from "../modules/dispute"
import PaymentModule from "@medusajs/medusa/payment"

export default defineLink(
  DisputeModule.linkable.dispute,
  PaymentModule.linkable.payment
)
```

- [ ] **Step 6: Commit**

```bash
git add packages/plugin-erp/src/modules/dispute/ packages/plugin-erp/src/links/
git commit -m "feat(plugin-erp): add Dispute module with data model, service, and links to Order/Payment"
```

---

### Task 6: Generate migrations and register modules

**Files:**
- Modify: `apps/backend/medusa-config.ts` (add ERP and Dispute modules + plugin)
- Modify: `apps/backend/package.json` (add workspace dependency)

- [ ] **Step 1: Add workspace dependency to backend**

Add to `apps/backend/package.json` dependencies:
```json
"@calilean/plugin-erp": "workspace:*"
```

Run: `cd /Users/mikebelloli/Development/projects-skafld/CaliLean && pnpm install`

- [ ] **Step 2: Register plugin and modules in medusa-config.ts**

Add to the `plugins` array in `apps/backend/medusa-config.ts`:
```ts
{
  resolve: "@calilean/plugin-erp",
  options: {}
}
```

Add to the `modules` array:
```ts
{
  resolve: "@calilean/plugin-erp/modules/erp",
  options: {
    encryption_key: process.env.ERP_ENCRYPTION_KEY,
  }
},
{
  resolve: "@calilean/plugin-erp/modules/dispute",
}
```

- [ ] **Step 3: Build the plugin**

Run: `cd packages/plugin-erp && pnpm build`

- [ ] **Step 4: Generate migrations**

Run: `cd packages/plugin-erp && pnpm medusa plugin:db:generate`

- [ ] **Step 5: Run migrations on backend**

Run: `cd apps/backend && pnpm medusa db:migrate`

- [ ] **Step 6: Verify — start dev server**

Run: `cd apps/backend && pnpm dev`
Expected: Server starts without errors, no migration warnings.

- [ ] **Step 7: Commit**

```bash
git add apps/backend/medusa-config.ts apps/backend/package.json packages/plugin-erp/ pnpm-lock.yaml
git commit -m "feat(plugin-erp): register ERP and Dispute modules, generate migrations"
```

---

## Phase 2: QBO Provider

### Task 7: QBO client — OAuth2 and REST API

**Files:**
- Create: `packages/plugin-erp/src/providers/quickbooks/types.ts`
- Create: `packages/plugin-erp/src/providers/quickbooks/client.ts`

- [ ] **Step 1: Create QBO types**

```ts
export type QboOptions = {
  client_id: string
  client_secret: string
  redirect_uri: string
  environment: "sandbox" | "production"
}

export type QboSalesReceipt = {
  Id?: string
  CustomerRef: { value: string }
  TxnDate: string
  Line: QboLine[]
  CurrencyRef: { value: string }
  PrivateNote?: string
  CustomField?: { DefinitionId: string; StringValue: string }[]
}

export type QboLine = {
  Amount: number
  DetailType: "SalesItemLineDetail" | "SubTotalLineDetail" | "DiscountLineDetail"
  SalesItemLineDetail?: {
    ItemRef: { value: string; name?: string }
    Qty: number
    UnitPrice: number
    TaxCodeRef?: { value: string }
  }
  Description?: string
}

export type QboCustomer = {
  Id?: string
  DisplayName: string
  PrimaryEmailAddr?: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  BillAddr?: {
    Line1?: string
    City?: string
    CountrySubDivisionCode?: string
    PostalCode?: string
    Country?: string
  }
  Active?: boolean
}

export type QboItem = {
  Id?: string
  Name: string
  Sku?: string
  Type: "NonInventory" | "Inventory" | "Service"
  IncomeAccountRef: { value: string }
  Active?: boolean
}

export type QboRefundReceipt = {
  Id?: string
  CustomerRef: { value: string }
  Line: QboLine[]
  CurrencyRef: { value: string }
  PrivateNote?: string
}
```

- [ ] **Step 2: Create QBO client**

```ts
import { MedusaError } from "@medusajs/framework/utils"
import { QboOptions } from "./types"

const SANDBOX_BASE_URL = "https://sandbox-quickbooks.api.intuit.com"
const PRODUCTION_BASE_URL = "https://quickbooks.api.intuit.com"

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export class QboClient {
  private options: QboOptions
  private baseUrl: string
  private accessToken: string | null = null
  private realmId: string | null = null

  constructor(options: QboOptions) {
    this.options = options
    this.baseUrl = options.environment === "production"
      ? PRODUCTION_BASE_URL
      : SANDBOX_BASE_URL
  }

  setCredentials(accessToken: string, realmId: string): void {
    this.accessToken = accessToken
    this.realmId = realmId
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = MAX_RETRIES): Promise<any> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const body = await response.text()
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `QBO API error ${response.status}: ${body}`
          )
        }

        return await response.json()
      } catch (error: any) {
        lastError = error
        const isRetryable =
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "UND_ERR_SOCKET"

        if (isRetryable && attempt < retries) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          break
        }
      }
    }

    throw lastError
  }

  private url(endpoint: string): string {
    return `${this.baseUrl}/v3/company/${this.realmId}/${endpoint}`
  }

  // --- Sales Receipts ---

  async createSalesReceipt(receipt: any): Promise<any> {
    return this.fetchWithRetry(this.url("salesreceipt"), {
      method: "POST",
      body: JSON.stringify(receipt),
    })
  }

  async voidSalesReceipt(id: string, syncToken: string): Promise<any> {
    return this.fetchWithRetry(this.url("salesreceipt?operation=void"), {
      method: "POST",
      body: JSON.stringify({ Id: id, SyncToken: syncToken, sparse: true }),
    })
  }

  async getSalesReceipt(id: string): Promise<any> {
    return this.fetchWithRetry(this.url(`salesreceipt/${id}`))
  }

  // --- Customers ---

  async createCustomer(customer: any): Promise<any> {
    return this.fetchWithRetry(this.url("customer"), {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  async updateCustomer(customer: any): Promise<any> {
    return this.fetchWithRetry(this.url("customer"), {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  async getCustomer(id: string): Promise<any> {
    return this.fetchWithRetry(this.url(`customer/${id}`))
  }

  // --- Items ---

  async createItem(item: any): Promise<any> {
    return this.fetchWithRetry(this.url("item"), {
      method: "POST",
      body: JSON.stringify(item),
    })
  }

  async updateItem(item: any): Promise<any> {
    return this.fetchWithRetry(this.url("item"), {
      method: "POST",
      body: JSON.stringify(item),
    })
  }

  // --- Refund Receipts ---

  async createRefundReceipt(refund: any): Promise<any> {
    return this.fetchWithRetry(this.url("refundreceipt"), {
      method: "POST",
      body: JSON.stringify(refund),
    })
  }

  async voidRefundReceipt(id: string, syncToken: string): Promise<any> {
    return this.fetchWithRetry(this.url("refundreceipt?operation=void"), {
      method: "POST",
      body: JSON.stringify({ Id: id, SyncToken: syncToken, sparse: true }),
    })
  }

  // --- Credit Memos ---

  async createCreditMemo(memo: any): Promise<any> {
    return this.fetchWithRetry(this.url("creditmemo"), {
      method: "POST",
      body: JSON.stringify(memo),
    })
  }

  // --- Query ---

  async query(queryString: string): Promise<any> {
    const encoded = encodeURIComponent(queryString)
    return this.fetchWithRetry(this.url(`query?query=${encoded}`))
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-erp/src/providers/quickbooks/
git commit -m "feat(plugin-erp): add QBO client with retry logic and REST API methods"
```

---

### Task 8: QBO mappers — Medusa entities to QBO format

**Files:**
- Create: `packages/plugin-erp/src/providers/quickbooks/mappers.ts`

- [ ] **Step 1: Create entity mappers**

```ts
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"
import { QboSalesReceipt, QboCustomer, QboItem, QboLine, QboRefundReceipt } from "./types"

export function mapOrderToSalesReceipt(order: OrderDTO): QboSalesReceipt {
  const lines: QboLine[] = (order.items || []).map((item) => ({
    Amount: Number(item.total || 0) / 100,
    DetailType: "SalesItemLineDetail" as const,
    SalesItemLineDetail: {
      ItemRef: { value: "1", name: item.title },
      Qty: item.quantity,
      UnitPrice: Number(item.unit_price || 0) / 100,
    },
    Description: item.title,
  }))

  return {
    CustomerRef: { value: "1" },
    TxnDate: new Date(order.created_at).toISOString().split("T")[0],
    Line: lines,
    CurrencyRef: { value: (order.currency_code || "USD").toUpperCase() },
    PrivateNote: `Medusa Order #${order.display_id} (${order.id})`,
  }
}

export function mapCustomerToQbo(customer: CustomerDTO): QboCustomer {
  return {
    DisplayName: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
    PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
    PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
    Active: true,
  }
}

export function mapProductToQboItem(product: { id: string; title: string; variants: any[] }): QboItem {
  return {
    Name: product.title.substring(0, 100),
    Sku: product.variants?.[0]?.sku || undefined,
    Type: "NonInventory",
    IncomeAccountRef: { value: "1" },
    Active: true,
  }
}

export function mapDisputeToRefundReceipt(dispute: {
  amount: number
  currency_code: string
  order_external_id: string
  customer_external_id?: string
  reason: string
}): QboRefundReceipt {
  return {
    CustomerRef: { value: dispute.customer_external_id || "1" },
    Line: [
      {
        Amount: dispute.amount / 100,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: "Chargeback" },
          Qty: 1,
          UnitPrice: dispute.amount / 100,
        },
        Description: `Dispute: ${dispute.reason}`,
      },
    ],
    CurrencyRef: { value: dispute.currency_code.toUpperCase() },
    PrivateNote: `Chargeback for Sales Receipt ${dispute.order_external_id}`,
  }
}
```

Note: The `CustomerRef` and `ItemRef` values of `"1"` are placeholders. During implementation, the provider service will look up or create the actual QBO entity IDs by querying QBO before creating records. The mapper produces the structure; the service fills in real references.

- [ ] **Step 2: Commit**

```bash
git add packages/plugin-erp/src/providers/quickbooks/mappers.ts
git commit -m "feat(plugin-erp): add Medusa → QBO entity mappers"
```

---

### Task 9: QBO provider service

**Files:**
- Create: `packages/plugin-erp/src/providers/quickbooks/service.ts`
- Create: `packages/plugin-erp/src/providers/quickbooks/index.ts`

- [ ] **Step 1: Create QboErpProviderService**

```ts
import { IErpProvider, ConnectionStatus, ErpInventoryLevel } from "../../modules/erp/types"
import { QboClient } from "./client"
import { QboOptions } from "./types"
import { mapOrderToSalesReceipt, mapCustomerToQbo, mapProductToQboItem, mapDisputeToRefundReceipt } from "./mappers"
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export class QboErpProviderService implements IErpProvider {
  static identifier = "quickbooks"
  identifier = "quickbooks"

  private client: QboClient
  private erpService: any

  constructor(container: Record<string, unknown>, options: QboOptions) {
    this.client = new QboClient(options)
    this.erpService = container["erp"] || null
  }

  private async ensureClient(): Promise<void> {
    if (!this.erpService) return
    const conn = await this.erpService.getConnection("quickbooks")
    if (conn?.access_token && conn?.realm_id) {
      this.client.setCredentials(conn.access_token, conn.realm_id)
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.ensureClient()
      await this.client.query("SELECT Id FROM CompanyInfo")
      return true
    } catch {
      return false
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const conn = this.erpService ? await this.erpService.getConnection("quickbooks") : null
    return {
      connected: conn?.is_connected ?? false,
      provider_id: "quickbooks",
      last_sync_at: conn?.last_sync_at?.toISOString() ?? null,
      token_expires_at: conn?.token_expires_at?.toISOString() ?? null,
      realm_id: conn?.realm_id ?? null,
    }
  }

  async createSalesReceipt(order: OrderDTO): Promise<string> {
    await this.ensureClient()
    const receipt = mapOrderToSalesReceipt(order)
    const result = await this.client.createSalesReceipt(receipt)
    return result.SalesReceipt.Id
  }

  async voidSalesReceipt(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getSalesReceipt(externalId)
    await this.client.voidSalesReceipt(externalId, existing.SalesReceipt.SyncToken)
  }

  async updateOrderStatus(externalId: string, status: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getSalesReceipt(externalId)
    await this.client.createSalesReceipt({
      ...existing.SalesReceipt,
      PrivateNote: `${existing.SalesReceipt.PrivateNote || ""} | Status: ${status}`,
      sparse: true,
    })
  }

  async recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    // QBO Sales Receipts are already "paid" — payment is implicit
    // Return the order's external ID as the payment reference
    return `payment-${paymentId}`
  }

  async recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    await this.ensureClient()
    const refund = await this.client.createRefundReceipt({
      CustomerRef: { value: "1" },
      Line: [{
        Amount: amount / 100,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: "Refund" },
          Qty: 1,
          UnitPrice: amount / 100,
        },
        Description: `Refund for payment ${paymentId}`,
      }],
      CurrencyRef: { value: currencyCode.toUpperCase() },
      PrivateNote: `Medusa refund for payment ${paymentId}`,
    })
    return refund.RefundReceipt.Id
  }

  async createCustomer(customer: CustomerDTO): Promise<string> {
    await this.ensureClient()
    const qboCustomer = mapCustomerToQbo(customer)
    const result = await this.client.createCustomer(qboCustomer)
    return result.Customer.Id
  }

  async updateCustomer(externalId: string, customer: CustomerDTO): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getCustomer(externalId)
    const qboCustomer = mapCustomerToQbo(customer)
    await this.client.updateCustomer({
      ...qboCustomer,
      Id: externalId,
      SyncToken: existing.Customer.SyncToken,
      sparse: true,
    })
  }

  async deactivateCustomer(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getCustomer(externalId)
    await this.client.updateCustomer({
      Id: externalId,
      SyncToken: existing.Customer.SyncToken,
      Active: false,
      sparse: true,
    })
  }

  async createItem(product: { id: string; title: string; variants: any[] }): Promise<string> {
    await this.ensureClient()
    const item = mapProductToQboItem(product)
    const result = await this.client.createItem(item)
    return result.Item.Id
  }

  async updateItem(externalId: string, product: { id: string; title: string; variants: any[] }): Promise<void> {
    await this.ensureClient()
    const item = mapProductToQboItem(product)
    await this.client.updateItem({
      ...item,
      Id: externalId,
      sparse: true,
    })
  }

  async createDisputeRefundReceipt(dispute: {
    id: string; amount: number; currency_code: string;
    order_external_id: string; customer_external_id?: string; reason: string
  }): Promise<string> {
    await this.ensureClient()
    const refund = mapDisputeToRefundReceipt(dispute)
    const result = await this.client.createRefundReceipt(refund)
    return result.RefundReceipt.Id
  }

  async voidDisputeRefundReceipt(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.createRefundReceipt({ Id: externalId })
    await this.client.voidRefundReceipt(externalId, existing.RefundReceipt?.SyncToken || "0")
  }

  async createCreditMemo(
    orderExternalId: string,
    items: { title: string; quantity: number; unit_price: number }[],
    amount: number,
    currencyCode: string
  ): Promise<string> {
    await this.ensureClient()
    const memo = await this.client.createCreditMemo({
      CustomerRef: { value: "1" },
      Line: items.map((item) => ({
        Amount: (item.unit_price * item.quantity) / 100,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: item.title },
          Qty: item.quantity,
          UnitPrice: item.unit_price / 100,
        },
        Description: item.title,
      })),
      CurrencyRef: { value: currencyCode.toUpperCase() },
      PrivateNote: `Credit memo for Sales Receipt ${orderExternalId}`,
    })
    return memo.CreditMemo.Id
  }

  async getInventoryLevels(): Promise<ErpInventoryLevel[]> {
    // QBO inventory is too basic — inventory pull comes from ERPNext
    return []
  }
}
```

- [ ] **Step 2: Create provider index.ts**

```ts
export { QboErpProviderService } from "./service"
```

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-erp/src/providers/quickbooks/
git commit -m "feat(plugin-erp): add QBO provider service implementing IErpProvider"
```

---

### Task 10: ERPNext provider (parallel to QBO)

**Files:**
- Create: `packages/plugin-erp/src/providers/erpnext/types.ts`
- Create: `packages/plugin-erp/src/providers/erpnext/client.ts`
- Create: `packages/plugin-erp/src/providers/erpnext/mappers.ts`
- Create: `packages/plugin-erp/src/providers/erpnext/service.ts`
- Create: `packages/plugin-erp/src/providers/erpnext/index.ts`

- [ ] **Step 1: Create ERPNext types**

```ts
export type ErpNextOptions = {
  api_url: string
  api_key: string
  api_secret: string
}
```

- [ ] **Step 2: Create ERPNext client**

```ts
import { MedusaError } from "@medusajs/framework/utils"
import { ErpNextOptions } from "./types"

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export class ErpNextClient {
  private options: ErpNextOptions

  constructor(options: ErpNextOptions) {
    this.options = options
  }

  private async fetchWithRetry(endpoint: string, init?: RequestInit, retries = MAX_RETRIES): Promise<any> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = `${this.options.api_url}/api/resource/${endpoint}`
        const response = await fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `token ${this.options.api_key}:${this.options.api_secret}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const body = await response.text()
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `ERPNext API error ${response.status}: ${body}`
          )
        }

        return await response.json()
      } catch (error: any) {
        lastError = error
        const isRetryable =
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "UND_ERR_SOCKET"

        if (isRetryable && attempt < retries) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          break
        }
      }
    }

    throw lastError
  }

  async createDocument(doctype: string, data: Record<string, unknown>): Promise<any> {
    return this.fetchWithRetry(doctype, {
      method: "POST",
      body: JSON.stringify({ data }),
    })
  }

  async updateDocument(doctype: string, name: string, data: Record<string, unknown>): Promise<any> {
    return this.fetchWithRetry(`${doctype}/${name}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    })
  }

  async getDocument(doctype: string, name: string): Promise<any> {
    return this.fetchWithRetry(`${doctype}/${name}`)
  }

  async cancelDocument(doctype: string, name: string): Promise<any> {
    const url = `${this.options.api_url}/api/method/frappe.client.cancel`
    return this.fetchWithRetry("", {
      method: "POST",
      body: JSON.stringify({ doctype, name }),
    })
  }

  async getList(doctype: string, filters?: Record<string, unknown>, fields?: string[]): Promise<any> {
    const params = new URLSearchParams()
    if (filters) params.set("filters", JSON.stringify(filters))
    if (fields) params.set("fields", JSON.stringify(fields))
    return this.fetchWithRetry(`${doctype}?${params.toString()}`)
  }
}
```

- [ ] **Step 3: Create ERPNext mappers**

```ts
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export function mapOrderToSalesInvoice(order: OrderDTO): Record<string, unknown> {
  return {
    doctype: "Sales Invoice",
    customer: order.email || "Walk-in Customer",
    posting_date: new Date(order.created_at).toISOString().split("T")[0],
    currency: (order.currency_code || "USD").toUpperCase(),
    items: (order.items || []).map((item) => ({
      item_name: item.title,
      qty: item.quantity,
      rate: Number(item.unit_price || 0) / 100,
      amount: Number(item.total || 0) / 100,
    })),
    custom_medusa_order_id: order.id,
    remarks: `Medusa Order #${order.display_id}`,
  }
}

export function mapCustomerToErpNext(customer: CustomerDTO): Record<string, unknown> {
  return {
    doctype: "Customer",
    customer_name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
    customer_type: "Individual",
    email_id: customer.email,
    mobile_no: customer.phone,
    custom_medusa_customer_id: customer.id,
  }
}

export function mapProductToErpNextItem(product: { id: string; title: string; variants: any[] }): Record<string, unknown> {
  return {
    doctype: "Item",
    item_name: product.title,
    item_code: product.variants?.[0]?.sku || product.id,
    item_group: "Products",
    stock_uom: "Nos",
    custom_medusa_product_id: product.id,
  }
}
```

- [ ] **Step 4: Create ERPNext provider service**

```ts
import { IErpProvider, ConnectionStatus, ErpInventoryLevel } from "../../modules/erp/types"
import { ErpNextClient } from "./client"
import { ErpNextOptions } from "./types"
import { mapOrderToSalesInvoice, mapCustomerToErpNext, mapProductToErpNextItem } from "./mappers"
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export class ErpNextProviderService implements IErpProvider {
  static identifier = "erpnext"
  identifier = "erpnext"

  private client: ErpNextClient

  constructor(container: Record<string, unknown>, options: ErpNextOptions) {
    this.client = new ErpNextClient(options)
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.getList("Company", {}, ["name"])
      return true
    } catch {
      return false
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const connected = await this.isConnected()
    return {
      connected,
      provider_id: "erpnext",
      last_sync_at: null,
      token_expires_at: null,
      realm_id: null,
    }
  }

  async createSalesReceipt(order: OrderDTO): Promise<string> {
    const invoice = mapOrderToSalesInvoice(order)
    const result = await this.client.createDocument("Sales Invoice", invoice)
    return result.data.name
  }

  async voidSalesReceipt(externalId: string): Promise<void> {
    await this.client.cancelDocument("Sales Invoice", externalId)
  }

  async updateOrderStatus(externalId: string, status: string): Promise<void> {
    await this.client.updateDocument("Sales Invoice", externalId, {
      custom_status: status,
    })
  }

  async recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    const result = await this.client.createDocument("Payment Entry", {
      payment_type: "Receive",
      party_type: "Customer",
      party: "Walk-in Customer",
      paid_amount: amount / 100,
      received_amount: amount / 100,
      reference_no: paymentId,
      reference_date: new Date().toISOString().split("T")[0],
      paid_to: "Cash - C",
      paid_from: "Debtors - C",
    })
    return result.data.name
  }

  async recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    const result = await this.client.createDocument("Journal Entry", {
      voucher_type: "Credit Note",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        { account: "Sales - C", debit_in_account_currency: amount / 100 },
        { account: "Cash - C", credit_in_account_currency: amount / 100 },
      ],
      remark: `Refund for payment ${paymentId}`,
    })
    return result.data.name
  }

  async createCustomer(customer: CustomerDTO): Promise<string> {
    const erpCustomer = mapCustomerToErpNext(customer)
    const result = await this.client.createDocument("Customer", erpCustomer)
    return result.data.name
  }

  async updateCustomer(externalId: string, customer: CustomerDTO): Promise<void> {
    const erpCustomer = mapCustomerToErpNext(customer)
    await this.client.updateDocument("Customer", externalId, erpCustomer)
  }

  async deactivateCustomer(externalId: string): Promise<void> {
    await this.client.updateDocument("Customer", externalId, { disabled: 1 })
  }

  async createItem(product: { id: string; title: string; variants: any[] }): Promise<string> {
    const item = mapProductToErpNextItem(product)
    const result = await this.client.createDocument("Item", item)
    return result.data.name
  }

  async updateItem(externalId: string, product: { id: string; title: string; variants: any[] }): Promise<void> {
    const item = mapProductToErpNextItem(product)
    await this.client.updateDocument("Item", externalId, item)
  }

  async createDisputeRefundReceipt(dispute: {
    id: string; amount: number; currency_code: string;
    order_external_id: string; customer_external_id?: string; reason: string
  }): Promise<string> {
    const result = await this.client.createDocument("Journal Entry", {
      voucher_type: "Credit Note",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        { account: "Sales - C", debit_in_account_currency: dispute.amount / 100 },
        { account: "Cash - C", credit_in_account_currency: dispute.amount / 100 },
      ],
      remark: `Dispute chargeback: ${dispute.reason} (Invoice: ${dispute.order_external_id})`,
    })
    return result.data.name
  }

  async voidDisputeRefundReceipt(externalId: string): Promise<void> {
    await this.client.cancelDocument("Journal Entry", externalId)
  }

  async createCreditMemo(
    orderExternalId: string,
    items: { title: string; quantity: number; unit_price: number }[],
    amount: number,
    currencyCode: string
  ): Promise<string> {
    const result = await this.client.createDocument("Sales Invoice", {
      is_return: 1,
      return_against: orderExternalId,
      items: items.map((item) => ({
        item_name: item.title,
        qty: -item.quantity,
        rate: item.unit_price / 100,
      })),
      currency: currencyCode.toUpperCase(),
    })
    return result.data.name
  }

  async getInventoryLevels(): Promise<ErpInventoryLevel[]> {
    const result = await this.client.getList("Bin", {}, [
      "item_code",
      "actual_qty",
      "warehouse",
    ])
    return (result.data || []).map((bin: any) => ({
      sku: bin.item_code,
      quantity: bin.actual_qty,
      location_id: bin.warehouse,
    }))
  }
}
```

- [ ] **Step 5: Create provider index.ts**

```ts
export { ErpNextProviderService } from "./service"
```

- [ ] **Step 6: Commit**

```bash
git add packages/plugin-erp/src/providers/erpnext/
git commit -m "feat(plugin-erp): add ERPNext provider service implementing IErpProvider"
```

---

## Phase 3: Workflows & Steps

### Task 11: Core sync step — syncToErpProvidersStep

**Files:**
- Create: `packages/plugin-erp/src/workflows/steps/sync-to-erp-providers.ts`

- [ ] **Step 1: Create the shared sync step**

```ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ERP_MODULE } from "../../modules/erp"
import { SyncResult } from "../../modules/erp/types"

type SyncInput = {
  action: string
  entity_id: string
  payload: any
}

export const syncToErpProvidersStep = createStep(
  {
    name: "sync-to-erp-providers",
    maxRetries: 3,
  },
  async (input: SyncInput, { container }) => {
    const erpService = container.resolve(ERP_MODULE) as any
    const providers = erpService.getAllProviders()
    const results: SyncResult[] = []
    const errors: { provider_id: string; error: string }[] = []

    for (const provider of providers) {
      try {
        const method = (provider as any)[input.action]
        if (typeof method !== "function") {
          continue
        }
        const externalId = await method.call(provider, ...input.payload)
        if (externalId) {
          results.push({ external_id: externalId, provider_id: provider.identifier })
        }
      } catch (error: any) {
        errors.push({ provider_id: provider.identifier, error: error.message })
        console.error(`ERP sync error [${provider.identifier}] ${input.action}:`, error.message)
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return StepResponse.permanentFailure(
        `All ERP providers failed for ${input.action}: ${errors.map((e) => `${e.provider_id}: ${e.error}`).join("; ")}`,
        { results, errors }
      )
    }

    return new StepResponse(results, { action: input.action, results })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.results) return

    const erpService = container.resolve(ERP_MODULE) as any
    const providers = erpService.getAllProviders()

    for (const result of compensationData.results) {
      const provider = providers.find((p: any) => p.identifier === result.provider_id)
      if (!provider) continue

      try {
        // Attempt to undo the action based on what was done
        const action = compensationData.action
        if (action === "createSalesReceipt") {
          await provider.voidSalesReceipt(result.external_id)
        } else if (action === "createCustomer") {
          await provider.deactivateCustomer(result.external_id)
        }
        // Other compensation actions can be added as needed
      } catch (error: any) {
        console.error(`ERP compensation error [${result.provider_id}]:`, error.message)
      }
    }
  }
)
```

- [ ] **Step 2: Commit**

```bash
git add packages/plugin-erp/src/workflows/steps/sync-to-erp-providers.ts
git commit -m "feat(plugin-erp): add core syncToErpProvidersStep with compensation"
```

---

### Task 12: Order sync workflow

**Files:**
- Create: `packages/plugin-erp/src/workflows/sync-order-to-erp.ts`

- [ ] **Step 1: Create order sync workflow**

```ts
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  order_id: string
  event_name: string
}

export const syncOrderToErpWorkflow = createWorkflow(
  "sync-order-to-erp",
  (input: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "shipping_methods.*",
        "customer.*",
        "summary.*",
        "total", "subtotal", "tax_total", "discount_total",
        "shipping_total", "item_total",
      ],
      filters: { id: input.order_id },
      options: { throwIfKeyNotFound: true },
    })

    const syncPayload = transform({ orders, input }, (data) => {
      const order = data.orders[0]
      const event = data.input.event_name

      if (event === "order.placed") {
        return { action: "createSalesReceipt", entity_id: order.id, payload: [order] }
      } else if (event === "order.canceled") {
        const externalId = order.metadata?.erp_ids as Record<string, string> | undefined
        if (!externalId) return null
        return { action: "voidSalesReceipt", entity_id: order.id, payload: [Object.values(externalId)[0]] }
      } else if (event === "order.completed") {
        const externalId = order.metadata?.erp_ids as Record<string, string> | undefined
        if (!externalId) return null
        return { action: "updateOrderStatus", entity_id: order.id, payload: [Object.values(externalId)[0], "completed"] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)

    return new WorkflowResponse(results)
  }
)
```

- [ ] **Step 2: Commit**

```bash
git add packages/plugin-erp/src/workflows/sync-order-to-erp.ts
git commit -m "feat(plugin-erp): add order sync workflow"
```

---

### Task 13: Payment, Customer, Product, and Dispute sync workflows

**Files:**
- Create: `packages/plugin-erp/src/workflows/sync-payment-to-erp.ts`
- Create: `packages/plugin-erp/src/workflows/sync-customer-to-erp.ts`
- Create: `packages/plugin-erp/src/workflows/sync-product-to-erp.ts`
- Create: `packages/plugin-erp/src/workflows/sync-dispute-to-erp.ts`
- Create: `packages/plugin-erp/src/workflows/index.ts`

- [ ] **Step 1: Create payment sync workflow**

```ts
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  payment_id: string
  event_name: string
}

export const syncPaymentToErpWorkflow = createWorkflow(
  "sync-payment-to-erp",
  (input: WorkflowInput) => {
    const { data: payments } = useQueryGraphStep({
      entity: "payment",
      fields: ["*", "payment_collection.*"],
      filters: { id: input.payment_id },
    })

    const syncPayload = transform({ payments, input }, (data) => {
      const payment = data.payments[0]
      const event = data.input.event_name

      if (event === "payment.captured") {
        return {
          action: "recordPayment",
          entity_id: payment.id,
          payload: [payment.id, payment.payment_collection?.id, Number(payment.amount), payment.currency_code],
        }
      } else if (event === "payment.refunded") {
        return {
          action: "recordRefund",
          entity_id: payment.id,
          payload: [payment.id, payment.payment_collection?.id, Number(payment.amount), payment.currency_code],
        }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
```

- [ ] **Step 2: Create customer sync workflow**

```ts
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  customer_id: string
  event_name: string
}

export const syncCustomerToErpWorkflow = createWorkflow(
  "sync-customer-to-erp",
  (input: WorkflowInput) => {
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["*"],
      filters: { id: input.customer_id },
    })

    const syncPayload = transform({ customers, input }, (data) => {
      const customer = data.customers[0]
      const event = data.input.event_name

      if (event === "customer.created") {
        return { action: "createCustomer", entity_id: customer.id, payload: [customer] }
      } else if (event === "customer.updated") {
        const externalIds = customer.metadata?.erp_ids as Record<string, string> | undefined
        if (!externalIds) return { action: "createCustomer", entity_id: customer.id, payload: [customer] }
        return { action: "updateCustomer", entity_id: customer.id, payload: [Object.values(externalIds)[0], customer] }
      } else if (event === "customer.deleted") {
        const externalIds = customer.metadata?.erp_ids as Record<string, string> | undefined
        if (!externalIds) return null
        return { action: "deactivateCustomer", entity_id: customer.id, payload: [Object.values(externalIds)[0]] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
```

- [ ] **Step 3: Create product sync workflow**

```ts
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  product_id: string
  event_name: string
}

export const syncProductToErpWorkflow = createWorkflow(
  "sync-product-to-erp",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["*", "variants.*"],
      filters: { id: input.product_id },
    })

    const syncPayload = transform({ products, input }, (data) => {
      const product = data.products[0]
      const event = data.input.event_name

      if (event === "product.created") {
        return { action: "createItem", entity_id: product.id, payload: [product] }
      } else if (event === "product.updated") {
        const externalIds = product.metadata?.erp_ids as Record<string, string> | undefined
        if (!externalIds) return { action: "createItem", entity_id: product.id, payload: [product] }
        return { action: "updateItem", entity_id: product.id, payload: [Object.values(externalIds)[0], product] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
```

- [ ] **Step 4: Create dispute sync workflow**

```ts
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  dispute_id: string
  event_name: string
}

export const syncDisputeToErpWorkflow = createWorkflow(
  "sync-dispute-to-erp",
  (input: WorkflowInput) => {
    const { data: disputes } = useQueryGraphStep({
      entity: "dispute",
      fields: ["*"],
      filters: { id: input.dispute_id },
    })

    const syncPayload = transform({ disputes, input }, (data) => {
      const dispute = data.disputes[0]
      const event = data.input.event_name

      if (event === "dispute.created") {
        return {
          action: "createDisputeRefundReceipt",
          entity_id: dispute.id,
          payload: [{
            id: dispute.id,
            amount: Number(dispute.amount),
            currency_code: dispute.currency_code,
            order_external_id: "",
            reason: dispute.reason,
          }],
        }
      } else if (event === "dispute.won") {
        const externalIds = dispute.metadata?.erp_ids as Record<string, string> | undefined
        if (!externalIds) return null
        return { action: "voidDisputeRefundReceipt", entity_id: dispute.id, payload: [Object.values(externalIds)[0]] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
```

- [ ] **Step 5: Create workflows index.ts**

```ts
export { syncOrderToErpWorkflow } from "./sync-order-to-erp"
export { syncPaymentToErpWorkflow } from "./sync-payment-to-erp"
export { syncCustomerToErpWorkflow } from "./sync-customer-to-erp"
export { syncProductToErpWorkflow } from "./sync-product-to-erp"
export { syncDisputeToErpWorkflow } from "./sync-dispute-to-erp"
```

- [ ] **Step 6: Commit**

```bash
git add packages/plugin-erp/src/workflows/
git commit -m "feat(plugin-erp): add payment, customer, product, and dispute sync workflows"
```

---

## Phase 4: Subscribers

### Task 14: All event subscribers

**Files:**
- Create: `packages/plugin-erp/src/subscribers/erp-order-sync.ts`
- Create: `packages/plugin-erp/src/subscribers/erp-order-changes-sync.ts`
- Create: `packages/plugin-erp/src/subscribers/erp-payment-sync.ts`
- Create: `packages/plugin-erp/src/subscribers/erp-customer-sync.ts`
- Create: `packages/plugin-erp/src/subscribers/erp-product-sync.ts`
- Create: `packages/plugin-erp/src/subscribers/erp-dispute-sync.ts`

- [ ] **Step 1: Create order sync subscriber**

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncOrderToErpWorkflow } from "../workflows/sync-order-to-erp"

export default async function erpOrderSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncOrderToErpWorkflow(container).run({
      input: { order_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP order sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.canceled", "order.completed"],
}
```

- [ ] **Step 2: Create order changes subscriber**

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncOrderToErpWorkflow } from "../workflows/sync-order-to-erp"

export default async function erpOrderChangesSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const orderId = "order_id" in data ? data.order_id : data.id
  try {
    await syncOrderToErpWorkflow(container).run({
      input: { order_id: orderId!, event_name: name },
    })
  } catch (error) {
    console.error(`ERP order changes sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.fulfillment_created",
    "order.fulfillment_canceled",
    "order.return_requested",
    "order.return_received",
    "order.claim_created",
    "order.exchange_created",
    "order-edit.confirmed",
  ],
}
```

- [ ] **Step 3: Create payment sync subscriber**

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncPaymentToErpWorkflow } from "../workflows/sync-payment-to-erp"

export default async function erpPaymentSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncPaymentToErpWorkflow(container).run({
      input: { payment_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP payment sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["payment.captured", "payment.refunded"],
}
```

- [ ] **Step 4: Create customer sync subscriber**

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncCustomerToErpWorkflow } from "../workflows/sync-customer-to-erp"

export default async function erpCustomerSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncCustomerToErpWorkflow(container).run({
      input: { customer_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP customer sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["customer.created", "customer.updated", "customer.deleted"],
}
```

- [ ] **Step 5: Create product sync subscriber**

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncProductToErpWorkflow } from "../workflows/sync-product-to-erp"

export default async function erpProductSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncProductToErpWorkflow(container).run({
      input: { product_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP product sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
```

- [ ] **Step 6: Create dispute sync subscriber**

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncDisputeToErpWorkflow } from "../workflows/sync-dispute-to-erp"

export default async function erpDisputeSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncDisputeToErpWorkflow(container).run({
      input: { dispute_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP dispute sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["dispute.created", "dispute.won", "dispute.lost"],
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/plugin-erp/src/subscribers/
git commit -m "feat(plugin-erp): add all ERP event subscribers"
```

---

## Phase 5: API Routes

### Task 15: Middleware and webhook routes

**Files:**
- Create: `packages/plugin-erp/src/api/middlewares.ts`
- Create: `packages/plugin-erp/src/api/erp/disputes/webhook/[provider_id]/route.ts`
- Create: `packages/plugin-erp/src/api/erp/inventory/webhook/route.ts`

- [ ] **Step 1: Create middleware config**

```ts
import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
      matcher: "/erp/**",
    },
  ],
})
```

- [ ] **Step 2: Create dispute webhook route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DISPUTE_MODULE } from "../../../../modules/dispute"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params
  const logger = req.scope.resolve("logger")

  try {
    const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
    const body = req.body as Record<string, unknown>

    const dispute = await disputeService.createDisputes({
      status: "open",
      reason: (body.reason as string) || "chargeback",
      amount: body.amount as number,
      currency_code: (body.currency_code as string) || "usd",
      provider_dispute_id: (body.dispute_id as string) || "",
      payment_provider: provider_id,
      evidence_submitted: false,
      metadata: body,
    })

    logger.info(`Dispute created from webhook [${provider_id}]: ${dispute.id}`)

    res.status(200).json({ received: true, dispute_id: dispute.id })
  } catch (error: any) {
    logger.error(`Dispute webhook error [${provider_id}]:`, error)
    res.status(500).json({ error: error.message })
  }
}
```

- [ ] **Step 3: Create inventory webhook route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  try {
    const body = req.body as { items?: { sku: string; quantity: number }[] }

    if (!body.items?.length) {
      return res.status(200).json({ received: true, updated: 0 })
    }

    // TODO: run updateInventoryFromErpWorkflow when implemented
    logger.info(`Inventory webhook received: ${body.items.length} items`)

    res.status(200).json({ received: true, updated: body.items.length })
  } catch (error: any) {
    logger.error("Inventory webhook error:", error)
    res.status(500).json({ error: error.message })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/plugin-erp/src/api/
git commit -m "feat(plugin-erp): add middleware and webhook routes for disputes and inventory"
```

---

### Task 16: Admin routes — sync status, connect, disconnect, disputes

**Files:**
- Create: `packages/plugin-erp/src/api/admin/erp/sync-status/route.ts`
- Create: `packages/plugin-erp/src/api/admin/erp/connect/[provider_id]/route.ts`
- Create: `packages/plugin-erp/src/api/admin/erp/connect/[provider_id]/callback/route.ts`
- Create: `packages/plugin-erp/src/api/admin/erp/disconnect/[provider_id]/route.ts`
- Create: `packages/plugin-erp/src/api/admin/erp/resync/route.ts`
- Create: `packages/plugin-erp/src/api/admin/disputes/route.ts`
- Create: `packages/plugin-erp/src/api/admin/disputes/[id]/route.ts`

- [ ] **Step 1: Create sync status route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ERP_MODULE } from "../../../../modules/erp"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const erpService = req.scope.resolve(ERP_MODULE) as any
  const providers = erpService.getAllProviders()

  const statuses: Record<string, any> = {}
  for (const provider of providers) {
    statuses[provider.identifier] = await provider.getConnectionStatus()
  }

  res.json({ providers: statuses })
}
```

- [ ] **Step 2: Create OAuth connect route (QBO)**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import OAuthClient from "intuit-oauth"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params

  if (provider_id !== "quickbooks") {
    return res.status(400).json({ error: "OAuth connect only supported for quickbooks" })
  }

  const oauthClient = new OAuthClient({
    clientId: process.env.QBO_CLIENT_ID!,
    clientSecret: process.env.QBO_CLIENT_SECRET!,
    environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    redirectUri: process.env.QBO_REDIRECT_URI!,
  })

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: "medusa-erp-connect",
  })

  res.redirect(authUri)
}
```

- [ ] **Step 3: Create OAuth callback route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import OAuthClient from "intuit-oauth"
import { ERP_MODULE } from "../../../../../modules/erp"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params

  if (provider_id !== "quickbooks") {
    return res.status(400).json({ error: "OAuth callback only supported for quickbooks" })
  }

  const oauthClient = new OAuthClient({
    clientId: process.env.QBO_CLIENT_ID!,
    clientSecret: process.env.QBO_CLIENT_SECRET!,
    environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    redirectUri: process.env.QBO_REDIRECT_URI!,
  })

  try {
    const authResponse = await oauthClient.createToken(req.url!)
    const token = authResponse.getJson()

    const erpService = req.scope.resolve(ERP_MODULE) as any
    await erpService.upsertConnection({
      provider_id: "quickbooks",
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_expires_at: new Date(Date.now() + token.expires_in * 1000),
      realm_id: token.realmId,
      is_connected: true,
    })

    res.redirect("/app/settings")
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
```

- [ ] **Step 4: Create disconnect route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ERP_MODULE } from "../../../../../modules/erp"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params
  const erpService = req.scope.resolve(ERP_MODULE) as any

  await erpService.upsertConnection({
    provider_id,
    access_token: "",
    refresh_token: "",
    is_connected: false,
  })

  res.json({ disconnected: true, provider_id })
}
```

- [ ] **Step 5: Create resync route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncOrderToErpWorkflow } from "../../../../workflows/sync-order-to-erp"
import { syncCustomerToErpWorkflow } from "../../../../workflows/sync-customer-to-erp"
import { syncProductToErpWorkflow } from "../../../../workflows/sync-product-to-erp"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { entity, entity_id } = req.body as { entity: string; entity_id: string }

  try {
    if (entity === "order") {
      await syncOrderToErpWorkflow(req.scope).run({
        input: { order_id: entity_id, event_name: "order.placed" },
      })
    } else if (entity === "customer") {
      await syncCustomerToErpWorkflow(req.scope).run({
        input: { customer_id: entity_id, event_name: "customer.created" },
      })
    } else if (entity === "product") {
      await syncProductToErpWorkflow(req.scope).run({
        input: { product_id: entity_id, event_name: "product.created" },
      })
    } else {
      return res.status(400).json({ error: `Unknown entity type: ${entity}` })
    }

    res.json({ success: true, entity, entity_id })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
```

- [ ] **Step 6: Create disputes list/create route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DISPUTE_MODULE } from "../../../../modules/dispute"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const disputes = await disputeService.listDisputes({})
  res.json({ disputes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const dispute = await disputeService.createDisputes(req.body)
  res.status(201).json({ dispute })
}
```

- [ ] **Step 7: Create dispute detail/update route**

```ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DISPUTE_MODULE } from "../../../../../modules/dispute"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const dispute = await disputeService.retrieveDispute(id)
  res.json({ dispute })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const dispute = await disputeService.updateDisputes({ id, ...req.body })
  res.json({ dispute })
}
```

- [ ] **Step 8: Commit**

```bash
git add packages/plugin-erp/src/api/
git commit -m "feat(plugin-erp): add admin routes for sync status, OAuth connect, disputes"
```

---

## Phase 6: Scheduled Jobs

### Task 17: Token refresh, inventory pull, and reconciliation jobs

**Files:**
- Create: `packages/plugin-erp/src/jobs/qbo-token-refresh.ts`
- Create: `packages/plugin-erp/src/jobs/erp-inventory-pull.ts`
- Create: `packages/plugin-erp/src/jobs/erp-reconciliation.ts`

- [ ] **Step 1: Create QBO token refresh job**

```ts
import { MedusaContainer } from "@medusajs/framework/types"
import { ERP_MODULE } from "../modules/erp"
import OAuthClient from "intuit-oauth"

export default async function qboTokenRefreshJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const erpService = container.resolve(ERP_MODULE) as any

  const conn = await erpService.getConnection("quickbooks")
  if (!conn?.is_connected || !conn?.refresh_token) {
    return
  }

  const expiresAt = new Date(conn.token_expires_at).getTime()
  const now = Date.now()
  const tenMinutes = 10 * 60 * 1000

  if (expiresAt - now > tenMinutes) {
    return
  }

  logger.info("Refreshing QBO access token...")

  try {
    const oauthClient = new OAuthClient({
      clientId: process.env.QBO_CLIENT_ID!,
      clientSecret: process.env.QBO_CLIENT_SECRET!,
      environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
      redirectUri: process.env.QBO_REDIRECT_URI!,
    })

    oauthClient.setToken({
      access_token: conn.access_token,
      refresh_token: conn.refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      x_refresh_token_expires_in: 8726400,
      realmId: conn.realm_id,
    })

    const authResponse = await oauthClient.refresh()
    const token = authResponse.getJson()

    await erpService.upsertConnection({
      provider_id: "quickbooks",
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_expires_at: new Date(Date.now() + token.expires_in * 1000),
      is_connected: true,
    })

    logger.info("QBO token refreshed successfully")
  } catch (error: any) {
    logger.error("QBO token refresh failed:", error.message)
  }
}

export const config = {
  name: "qbo-token-refresh",
  schedule: "*/50 * * * *",
}
```

- [ ] **Step 2: Create inventory pull job**

```ts
import { MedusaContainer } from "@medusajs/framework/types"
import { ERP_MODULE } from "../modules/erp"

export default async function erpInventoryPullJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const erpService = container.resolve(ERP_MODULE) as any

  const providers = erpService.getAllProviders()

  for (const provider of providers) {
    try {
      const levels = await provider.getInventoryLevels()
      if (levels.length === 0) continue

      logger.info(`Pulled ${levels.length} inventory levels from ${provider.identifier}`)

      // TODO: match SKUs to Medusa variants and update stock levels
      // This will use Medusa's inventory module to update levels
    } catch (error: any) {
      logger.error(`Inventory pull error [${provider.identifier}]:`, error.message)
    }
  }
}

export const config = {
  name: "erp-inventory-pull",
  schedule: "0 * * * *",
}
```

- [ ] **Step 3: Create reconciliation job**

```ts
import { MedusaContainer } from "@medusajs/framework/types"
import { ERP_MODULE } from "../modules/erp"

export default async function erpReconciliationJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const erpService = container.resolve(ERP_MODULE) as any

  logger.info("Starting daily ERP reconciliation...")

  const query = container.resolve("query")

  // Get orders from the last 24 hours that should have been synced
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { data: recentOrders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "metadata", "created_at"],
    filters: {
      created_at: { $gte: oneDayAgo.toISOString() },
    },
  })

  const missingSync = recentOrders.filter(
    (order: any) => !order.metadata?.erp_ids
  )

  if (missingSync.length > 0) {
    logger.warn(
      `ERP reconciliation: ${missingSync.length} orders missing ERP sync: ${missingSync.map((o: any) => o.display_id).join(", ")}`
    )
  } else {
    logger.info(`ERP reconciliation: all ${recentOrders.length} recent orders synced`)
  }
}

export const config = {
  name: "erp-reconciliation",
  schedule: "0 0 * * *",
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/plugin-erp/src/jobs/
git commit -m "feat(plugin-erp): add scheduled jobs for token refresh, inventory pull, reconciliation"
```

---

## Phase 7: Build & Verify

### Task 18: Build plugin and verify integration

- [ ] **Step 1: Build the plugin**

Run: `cd packages/plugin-erp && pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Generate migrations for new models**

Run: `cd packages/plugin-erp && pnpm medusa plugin:db:generate`
Expected: Migration files created for `erp_connection` and `dispute` tables.

- [ ] **Step 3: Run migrations**

Run: `cd apps/backend && pnpm medusa db:migrate`
Expected: Tables created in database.

- [ ] **Step 4: Start dev server and verify**

Run: `cd apps/backend && pnpm dev`
Expected: Server starts, no module resolution errors, scheduled jobs register.

- [ ] **Step 5: Test sync status endpoint**

Run: `curl -H "Authorization: Bearer <admin_token>" http://localhost:9000/admin/erp/sync-status`
Expected: JSON response with provider connection statuses.

- [ ] **Step 6: Test disputes endpoint**

Run: `curl -H "Authorization: Bearer <admin_token>" http://localhost:9000/admin/disputes`
Expected: `{ "disputes": [] }`

- [ ] **Step 7: Commit all remaining changes**

```bash
git add .
git commit -m "feat(plugin-erp): complete ERP integration plugin with QBO and ERPNext providers"
```
