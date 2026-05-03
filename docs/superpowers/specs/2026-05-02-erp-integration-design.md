# ERP Integration Module Design — `@calilean/plugin-erp`

**Date**: 2026-05-02
**Status**: Draft
**Author**: Claude + Mike

## Overview

A Medusa v2 plugin that syncs CaliLean's commerce data to QuickBooks Online (QBO) and ERPNext via a provider-based architecture. Medusa is the source of truth for products, orders, customers, inventory, and payments. Both ERPs receive real-time event-driven syncs. ERPNext mirrors QBO as a shadow system that may become primary over time.

## Architecture

### Source of Truth

Medusa owns all commerce data. ERPs are downstream sync targets. Rationale:

- Medusa handles payment processing (ACH, high-risk CC, crypto)
- Medusa has built-in inventory module with reservations
- Both ERPs are greenfield — no existing data to respect
- Real-time storefront stock checks stay local (no ERP roundtrip)

### Plugin Structure

Single plugin package following Medusa's provider pattern (same as Fulfillment, Notification, Payment modules):

```
packages/plugin-erp/
├── src/
│   ├── modules/
│   │   ├── erp/                    # Core ERP module
│   │   │   ├── index.ts            # Module definition
│   │   │   ├── service.ts          # ErpModuleService (provider registry)
│   │   │   ├── models/
│   │   │   │   └── erp-connection.ts  # OAuth tokens + connection state
│   │   │   ├── migrations/
│   │   │   └── types.ts            # IErpProvider interface
│   │   └── dispute/                # Dispute tracking module
│   │       ├── index.ts
│   │       ├── service.ts          # DisputeModuleService (MedusaService)
│   │       ├── models/
│   │       │   └── dispute.ts      # Dispute data model
│   │       └── migrations/
│   ├── providers/
│   │   ├── quickbooks/
│   │   │   ├── index.ts            # Provider registration
│   │   │   ├── service.ts          # QboErpProviderService
│   │   │   ├── client.ts           # QBO API client (OAuth2 + REST)
│   │   │   ├── mappers.ts          # Medusa → QBO entity transforms
│   │   │   └── types.ts
│   │   └── erpnext/
│   │       ├── index.ts
│   │       ├── service.ts          # ErpNextProviderService
│   │       ├── client.ts           # ERPNext API client
│   │       ├── mappers.ts          # Medusa → ERPNext entity transforms
│   │       └── types.ts
│   ├── subscribers/                # Event listeners → workflows
│   ├── workflows/                  # Sync workflows with compensation
│   ├── links/                      # dispute ↔ order, dispute ↔ payment
│   ├── api/                        # Webhook + admin routes
│   ├── jobs/                       # Scheduled reconciliation + token refresh
│   └── admin/                      # Admin UI extensions
```

### Registration in medusa-config.ts

```ts
plugins: [
  {
    resolve: "@calilean/plugin-erp",
    options: {
      providers: [
        {
          resolve: "@calilean/plugin-erp/providers/quickbooks",
          id: "quickbooks",
          options: {
            client_id: process.env.QBO_CLIENT_ID,
            client_secret: process.env.QBO_CLIENT_SECRET,
            redirect_uri: process.env.QBO_REDIRECT_URI,
            environment: process.env.QBO_ENVIRONMENT, // "sandbox" | "production"
          }
        },
        {
          resolve: "@calilean/plugin-erp/providers/erpnext",
          id: "erpnext",
          options: {
            api_url: process.env.ERPNEXT_API_URL,
            api_key: process.env.ERPNEXT_API_KEY,
            api_secret: process.env.ERPNEXT_API_SECRET,
          }
        }
      ]
    }
  }
]
```

## Provider Interface

Every ERP provider implements `IErpProvider`:

```ts
interface IErpProvider {
  // Connection
  isConnected(): Promise<boolean>
  getConnectionStatus(): Promise<ConnectionStatus>

  // Orders
  createSalesReceipt(order: OrderDTO): Promise<string>   // returns external_id
  voidSalesReceipt(externalId: string): Promise<void>
  updateOrderStatus(externalId: string, status: string): Promise<void>

  // Payments
  recordPayment(payment: PaymentDTO): Promise<string>
  recordRefund(payment: PaymentDTO, amount: number): Promise<string>

  // Customers
  createCustomer(customer: CustomerDTO): Promise<string>
  updateCustomer(externalId: string, customer: CustomerDTO): Promise<void>
  deactivateCustomer(externalId: string): Promise<void>

  // Products
  createItem(product: ProductDTO): Promise<string>
  updateItem(externalId: string, product: ProductDTO): Promise<void>

  // Disputes
  createDisputeRefundReceipt(dispute: DisputeDTO): Promise<string>
  voidDisputeRefundReceipt(externalId: string): Promise<void>

  // Returns & Exchanges
  createCreditMemo(order: OrderDTO, items: LineItemDTO[]): Promise<string>

  // Inventory (pull)
  getInventoryLevels(): Promise<InventoryLevel[]>
}
```

## Data Models

### ErpConnection

Stores OAuth tokens and connection state per provider:

```ts
const ErpConnection = model.define("erp_connection", {
  id: model.id().primaryKey(),
  provider_id: model.text(),              // "quickbooks" | "erpnext"
  access_token: model.text(),             // encrypted at rest
  refresh_token: model.text(),            // encrypted at rest
  token_expires_at: model.dateTime(),
  realm_id: model.text().nullable(),      // QBO company ID
  api_url: model.text().nullable(),       // ERPNext base URL
  is_connected: model.boolean().default(false),
  last_sync_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})
```

Tokens encrypted using Node `crypto` with `ERP_ENCRYPTION_KEY` env var.

### Dispute

Tracks payment disputes/chargebacks — Medusa has no built-in dispute model:

```ts
const Dispute = model.define("dispute", {
  id: model.id().primaryKey(),
  status: model.enum(["open", "under_review", "won", "lost"]),
  reason: model.text(),
  amount: model.bigNumber(),
  currency_code: model.text(),
  provider_dispute_id: model.text(),
  payment_provider: model.text(),
  evidence_submitted: model.boolean().default(false),
  resolved_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})
```

### Module Links

```ts
// links/dispute-order.ts
defineLink(DisputeModule.linkable.dispute, OrderModule.linkable.order)

// links/dispute-payment.ts
defineLink(DisputeModule.linkable.dispute, PaymentModule.linkable.payment)
```

## Event → Sync Map

### Built-in Medusa Events

| Event | ERP Action | QBO Entity | ERPNext Entity |
|-------|-----------|------------|----------------|
| `order.placed` | Create sale record | Sales Receipt | Sales Invoice |
| `order.canceled` | Void sale record | Void Sales Receipt | Cancel Invoice |
| `order.completed` | Mark complete | Update Sales Receipt | Update Invoice |
| `order.fulfillment_created` | Update fulfillment | Update Sales Receipt memo | Update Invoice |
| `order.fulfillment_canceled` | Reverse fulfillment | Update Sales Receipt memo | Update Invoice |
| `order.return_requested` | Create pending return | (no action until received) | (no action) |
| `order.return_received` | Create credit | Credit Memo | Credit Note + Stock Entry |
| `order.claim_created` | Record claim | Credit Memo | Credit Note |
| `order.exchange_created` | Record exchange | New Sales Receipt + Credit Memo | New Invoice + Credit Note |
| `order-edit.confirmed` | Update line items | Update Sales Receipt | Update Invoice |
| `payment.captured` | Record payment | Payment (on Sales Receipt) | Payment Entry |
| `payment.refunded` | Record refund | Refund Receipt | Credit Note |
| `product.created` | Create item | Item | Item |
| `product.updated` | Update item | Item update | Item update |
| `customer.created` | Create customer | Customer | Customer |
| `customer.updated` | Update customer | Customer update | Customer update |
| `customer.deleted` | Deactivate | Make inactive | Disable |

### Custom Events (emitted via emitEventStep)

| Event | ERP Action | QBO Entity | ERPNext Entity |
|-------|-----------|------------|----------------|
| `dispute.created` | Record chargeback | Refund Receipt (linked to original sale) | Credit Note |
| `dispute.won` | Reverse chargeback | Void Refund Receipt | Cancel Credit Note |
| `dispute.lost` | Write off | Refund Receipt stays; reclassify to Bad Debt | Credit Note stays |

### Accounting Decisions

- **Sales Receipts over Invoices** in QBO: payment is captured at checkout (ACH/CC/crypto), so the sale is already paid. Sales Receipts are the correct QBO entity.
- **Refund Receipts for disputes** (not Journal Entries): maintains audit trail back to the original sale, keeps customer history clean, makes bank reconciliation easier.
- **Inventory pull only from ERPNext**: QBO's inventory is too basic. ERPNext handles warehouse operations.

## Subscribers

One subscriber file per domain, each calling a shared sync workflow:

```
subscribers/
├── erp-order-sync.ts          # order.placed, order.canceled, order.completed
├── erp-order-changes-sync.ts  # order.fulfillment_created, order.fulfillment_canceled,
│                              # order.return_requested, order.return_received,
│                              # order.claim_created, order.exchange_created,
│                              # order-edit.confirmed
├── erp-payment-sync.ts        # payment.captured, payment.refunded
├── erp-customer-sync.ts       # customer.created, customer.updated, customer.deleted
├── erp-product-sync.ts        # product.created, product.updated
├── erp-dispute-sync.ts        # dispute.created, dispute.won, dispute.lost
```

## Workflow Pattern

Every sync workflow follows a 3-step structure:

1. **Query full entity** — `useQueryGraphStep` with all fields including `summary.*` for accounting totals
2. **Sync to all providers** — `syncToErpProvidersStep` iterates registered providers; maps entity to provider format; calls provider method; compensation function undoes on failure
3. **Store external IDs** — updates entity metadata with `erp_ids: { quickbooks: "SR-1234", erpnext: "SI-0056" }`

### Order Query Fields

```ts
useQueryGraphStep({
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
  filters: { id: order_id },
  options: { throwIfKeyNotFound: true },
})
```

### Error Handling

| Failure | Behavior |
|---------|----------|
| Single provider fails | Compensation rolls back that provider only; other providers unaffected |
| All providers fail | Full workflow rollback; log error; retry via Redis event bus |
| QBO token expired | Token refresh job handles proactively; if mid-sync, refresh inline and retry once |
| Network timeout | Retry with exponential backoff (`1s → 2s → 4s`, max 3 retries) |
| Mapping error | `StepResponse.permanentFailure()` — fail loudly, log full entity + error |

Steps calling external APIs use `maxRetries: 3` with exponential backoff per Medusa's best practices.

## Scheduled Jobs

```
jobs/
├── erp-reconciliation.ts      # Daily midnight: compare Medusa orders vs ERP records, flag mismatches
├── erp-inventory-pull.ts      # Hourly: pull inventory levels from ERPNext → update Medusa variants
├── qbo-token-refresh.ts       # Every 50 min: refresh QBO OAuth2 access token (60 min expiry)
```

### Token Refresh Details

- Access token: 60 min lifespan → refresh every 50 min
- Refresh token: 100 day lifespan → alert admin at 85 days, re-auth required if expired
- Tokens encrypted at rest with `ERP_ENCRYPTION_KEY`

## API Routes

### Webhook Routes (inbound)

| Route | Purpose | Auth |
|-------|---------|------|
| `POST /erp/disputes/webhook/:provider_id` | Receive dispute events from payment providers | Webhook signature |
| `POST /erp/inventory/webhook` | ERPNext stock updates | API key / HMAC |
| `POST /erp/order-updates` | ERP → Medusa order status sync | API key / HMAC |

All webhook routes use `preserveRawBody: true` middleware.

### Admin Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `GET /admin/erp/sync-status` | Health check per provider | Admin JWT |
| `POST /admin/erp/resync` | Manually re-trigger sync for entity | Admin JWT |
| `GET /admin/erp/connect/:provider_id` | OAuth redirect (QBO) | Admin JWT |
| `GET /admin/erp/connect/:provider_id/callback` | OAuth callback | Admin JWT |
| `POST /admin/erp/disconnect/:provider_id` | Revoke tokens | Admin JWT |
| `GET /admin/disputes` | List disputes | Admin JWT |
| `POST /admin/disputes` | Manual dispute creation | Admin JWT |
| `GET /admin/disputes/:id` | Dispute detail | Admin JWT |
| `POST /admin/disputes/:id` | Update dispute status | Admin JWT |

All admin routes validated with Zod schemas.

## QBO OAuth2 Flow

```
Admin clicks "Connect QuickBooks"
  → GET /admin/erp/connect/quickbooks
  → Redirect to Intuit OAuth2 authorization URL
  → User authorizes on Intuit's site
  → GET /admin/erp/connect/quickbooks/callback
  → Exchange auth code for access + refresh tokens
  → Encrypt and store in erp_connection record
  → Set is_connected = true
  → Redirect back to admin dashboard
```

ERPNext uses static API key + secret via env vars — no OAuth flow needed.

## Environment Variables

```bash
# QBO OAuth2
QBO_CLIENT_ID=
QBO_CLIENT_SECRET=
QBO_REDIRECT_URI=
QBO_ENVIRONMENT=sandbox  # or "production"

# ERPNext
ERPNEXT_API_URL=
ERPNEXT_API_KEY=
ERPNEXT_API_SECRET=

# Token encryption
ERP_ENCRYPTION_KEY=  # 32-byte hex key for AES-256
```

## Dependencies

```json
{
  "intuit-oauth": "^4.x",     // QBO OAuth2 client
  "node-quickbooks": "^3.x",  // QBO API wrapper (or raw fetch)
  "frappe-js-sdk": "^1.x"     // ERPNext Frappe API client (or raw fetch)
}
```

Final dependency choice (SDK vs raw fetch) to be determined during implementation based on SDK quality and maintenance status.

## Data Flow Direction Summary

```
                    Medusa (Source of Truth)
                   ┌─────────────────────────┐
                   │ Products, Orders,        │
                   │ Customers, Inventory,    │
                   │ Payments, Disputes       │
                   └────┬──────────┬──────────┘
          push (events) │          │ push (events)
                        ▼          ▼
                   ┌─────────┐ ┌──────────┐
                   │   QBO   │ │ ERPNext  │
                   │ (primary│ │ (mirror, │
                   │  books) │ │  growing)│
                   └─────────┘ └────┬─────┘
                                    │ pull (inventory,
                                    │  hourly cron)
                                    ▼
                              Medusa updates
                              variant stock
```
