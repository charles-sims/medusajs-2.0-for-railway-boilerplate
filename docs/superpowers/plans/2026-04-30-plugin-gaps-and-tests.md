# Plugin Gaps, Test Infrastructure & Abandoned Cart — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill missing subscribers/hooks in plugin-invoices and plugin-loyalty, scaffold Jest test infrastructure across all 7 plugins, and port the abandoned-cart feature from medusa-examples.

**Architecture:** Each plugin gets a `jest.config.js`, `integration-tests/setup.js`, and a baseline `health.spec.ts`. Invoice and loyalty plugins get the missing event subscribers and workflow hooks that connect them to Medusa's order lifecycle. Abandoned cart is implemented as a scheduled job + workflow in the backend `src/` (not a plugin — it's app-level logic).

**Tech Stack:** Medusa v2.14, Jest + @medusajs/test-utils + @swc/jest, Resend notification provider

---

### Task 1: Invoice Subscriber — order-placed

**Files:**
- Create: `packages/plugin-invoices/src/subscribers/order-placed.ts`

- [ ] **Step 1: Create the order-placed subscriber**

```typescript
// packages/plugin-invoices/src/subscribers/order-placed.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { generateInvoicePdfWorkflow } from "../workflows/generate-invoice-pdf"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "email", "display_id"],
    filters: { id: data.id },
  })

  const order = orders[0]
  if (!order?.email) return

  const { result } = await generateInvoicePdfWorkflow(container).run({
    input: { order_id: order.id },
  })

  if (!result?.pdf_buffer) return

  const pdfBinary =
    typeof result.pdf_buffer === "string"
      ? result.pdf_buffer
      : Buffer.from(result.pdf_buffer).toString("binary")

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-placed",
      data: {
        emailOptions: {
          subject: `Invoice for order #${order.display_id}`,
          replyTo: "hello@calilean.com",
        },
        order,
      },
      attachments: [
        {
          filename: `invoice-${order.display_id}.pdf`,
          content: pdfBinary,
          content_type: "application/pdf",
        },
      ],
    })
  } catch (error) {
    console.error(`Failed to send invoice email for order ${order.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

- [ ] **Step 2: Rebuild the plugin**

```bash
cd packages/plugin-invoices && pnpm build
```

Expected: `Plugin build completed successfully`

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-invoices/src/subscribers/order-placed.ts
git commit -m "feat(plugin-invoices): add order-placed subscriber for invoice PDF email"
```

---

### Task 2: Invoice Subscriber — order-updated (mark stale)

**Files:**
- Create: `packages/plugin-invoices/src/subscribers/order-updated.ts`

- [ ] **Step 1: Create the order-updated subscriber**

```typescript
// packages/plugin-invoices/src/subscribers/order-updated.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { markInvoicesStaleWorkflow } from "../workflows/mark-invoices-stale"

export default async function orderUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id?: string; order_id?: string }>) {
  const orderId = data.id || data.order_id
  if (!orderId) return

  try {
    await markInvoicesStaleWorkflow(container).run({
      input: { order_id: orderId },
    })
  } catch (error) {
    console.error(`Failed to mark invoices stale for order ${orderId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.updated",
    "order-edit.confirmed",
    "order.exchange_created",
    "order.claim_created",
    "order.return_received",
  ],
}
```

- [ ] **Step 2: Rebuild the plugin**

```bash
cd packages/plugin-invoices && pnpm build
```

Expected: `Plugin build completed successfully`

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-invoices/src/subscribers/order-updated.ts
git commit -m "feat(plugin-invoices): add order-updated subscriber to mark invoices stale"
```

---

### Task 3: Loyalty Subscriber — order-placed

**Files:**
- Create: `packages/plugin-loyalty/src/subscribers/order-placed.ts`

- [ ] **Step 1: Create the order-placed subscriber**

```typescript
// packages/plugin-loyalty/src/subscribers/order-placed.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { handleOrderPointsWorkflow } from "../workflows/handle-order-points"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await handleOrderPointsWorkflow(container).run({
      input: { order_id: data.id },
    })
  } catch (error) {
    console.error(`Failed to handle loyalty points for order ${data.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

- [ ] **Step 2: Rebuild the plugin**

```bash
cd packages/plugin-loyalty && pnpm build
```

Expected: `Plugin build completed successfully`

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-loyalty/src/subscribers/order-placed.ts
git commit -m "feat(plugin-loyalty): add order-placed subscriber to award/deduct points"
```

---

### Task 4: Loyalty Workflow Hook — complete-cart validation

**Files:**
- Create: `packages/plugin-loyalty/src/workflows/hooks/complete-cart.ts`

- [ ] **Step 1: Create the hooks directory and file**

```bash
mkdir -p packages/plugin-loyalty/src/workflows/hooks
```

```typescript
// packages/plugin-loyalty/src/workflows/hooks/complete-cart.ts
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { getCartLoyaltyPromotion } from "../../utils/promo"
import { MedusaError } from "@medusajs/framework/utils"
import { CartData } from "../../utils/promo"

completeCartWorkflow.hooks.validate(async ({ cart, additional_data }, { container }) => {
  const query = container.resolve("query")

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "promotions.*",
      "promotions.rules.*",
      "promotions.rules.values.*",
      "promotions.application_method.*",
      "customer.*",
    ],
    filters: { id: cart.id },
  })

  const fullCart = carts[0] as unknown as CartData
  const loyaltyPromo = getCartLoyaltyPromotion(fullCart)

  if (!loyaltyPromo || !fullCart.customer?.id) return

  const LOYALTY_POINT_MODULE = "loyaltyModuleService"
  const loyaltyService = container.resolve(LOYALTY_POINT_MODULE)
  const customerPoints = await loyaltyService.getPoints(fullCart.customer.id)
  const requiredPoints = loyaltyPromo.application_method?.value || 0

  if (customerPoints < requiredPoints) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Insufficient loyalty points. You have ${customerPoints} but need ${requiredPoints}.`
    )
  }
})
```

- [ ] **Step 2: Rebuild the plugin**

```bash
cd packages/plugin-loyalty && pnpm build
```

Expected: `Plugin build completed successfully`

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-loyalty/src/workflows/hooks/complete-cart.ts
git commit -m "feat(plugin-loyalty): add cart completion hook to validate loyalty points"
```

---

### Task 5: Test Infrastructure — scaffold all plugins

**Files (per plugin):**
- Create: `packages/plugin-{name}/jest.config.js`
- Create: `packages/plugin-{name}/integration-tests/setup.js`
- Create: `packages/plugin-{name}/integration-tests/http/health.spec.ts`

- [ ] **Step 1: Create a script to scaffold tests across all plugins**

```bash
# Run from repo root
for plugin in bundles email invoices loyalty preorder reviews shipstation subscription; do
  DIR="packages/plugin-${plugin}"

  # jest.config.js
  cat > "${DIR}/jest.config.js" << 'JESTEOF'
const { loadEnv } = require("@medusajs/utils");
loadEnv("test", process.cwd());

module.exports = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/", "<rootDir>/.medusa/"],
  setupFiles: ["./integration-tests/setup.js"],
};

if (process.env.TEST_TYPE === "integration:http") {
  module.exports.testMatch = ["**/integration-tests/http/*.spec.[jt]s"];
} else if (process.env.TEST_TYPE === "integration:modules") {
  module.exports.testMatch = ["**/src/modules/*/__tests__/**/*.[jt]s"];
} else if (process.env.TEST_TYPE === "unit") {
  module.exports.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"];
}
JESTEOF

  # integration-tests/setup.js
  mkdir -p "${DIR}/integration-tests/http"
  cat > "${DIR}/integration-tests/setup.js" << 'SETUPEOF'
const { MetadataStorage } = require("@medusajs/framework/mikro-orm/core")

MetadataStorage.clear()
SETUPEOF

  # integration-tests/http/health.spec.ts
  cat > "${DIR}/integration-tests/http/health.spec.ts" << 'SPECEOF'
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    describe("Ping", () => {
      it("ping the server health endpoint", async () => {
        const response = await api.get("/health")
        expect(response.status).toEqual(200)
      })
    })
  },
})
SPECEOF

  echo "Scaffolded tests for plugin-${plugin}"
done
```

- [ ] **Step 2: Add test scripts to each plugin's package.json**

For each plugin, ensure `package.json` has these scripts (check existing and add if missing):

```json
{
  "scripts": {
    "test": "jest",
    "test:integration": "TEST_TYPE=integration:http jest --runInBand",
    "test:unit": "TEST_TYPE=unit jest"
  }
}
```

Run this to patch them all:

```bash
for plugin in bundles email invoices loyalty preorder reviews shipstation subscription; do
  DIR="packages/plugin-${plugin}"
  node -e "
    const pkg = require('./${DIR}/package.json');
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.test = pkg.scripts.test || 'jest';
    pkg.scripts['test:integration'] = 'TEST_TYPE=integration:http jest --runInBand';
    pkg.scripts['test:unit'] = 'TEST_TYPE=unit jest';
    require('fs').writeFileSync('./${DIR}/package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  echo "Updated scripts for plugin-${plugin}"
done
```

- [ ] **Step 3: Verify one plugin's test runs**

```bash
cd packages/plugin-bundles && pnpm test:integration 2>&1 | tail -5
```

Expected: Test runner initializes (may fail on DB connection in CI, but Jest config loads correctly)

- [ ] **Step 4: Commit**

```bash
git add packages/*/jest.config.js packages/*/integration-tests/ packages/*/package.json
git commit -m "feat: scaffold Jest test infrastructure across all plugins"
```

---

### Task 6: Abandoned Cart — scheduled job

**Files:**
- Create: `apps/backend/src/jobs/send-abandoned-cart-notification.ts`

- [ ] **Step 1: Create the scheduled job**

```typescript
// apps/backend/src/jobs/send-abandoned-cart-notification.ts
import { MedusaContainer } from "@medusajs/framework/types"
import { sendAbandonedCartsWorkflow } from "../workflows/send-abandoned-carts"

export default async function sendAbandonedCartNotification(
  container: MedusaContainer
) {
  const query = container.resolve("query")
  const logger = container.resolve("logger")

  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  let offset = 0
  const limit = 100
  let totalSent = 0

  while (true) {
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "email",
        "updated_at",
        "completed_at",
        "metadata",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
        "customer.*",
      ],
      filters: {
        updated_at: { $lt: oneDayAgo },
        completed_at: null,
      },
      pagination: { skip: offset, take: limit },
    })

    if (!carts.length) break

    const eligibleCarts = carts.filter(
      (cart: any) =>
        cart.email &&
        cart.items?.length > 0 &&
        !cart.metadata?.abandoned_notification
    )

    if (eligibleCarts.length > 0) {
      try {
        await sendAbandonedCartsWorkflow(container).run({
          input: { carts: eligibleCarts },
        })
        totalSent += eligibleCarts.length
      } catch (error) {
        logger.error("Failed to send abandoned cart notifications:", error)
      }
    }

    if (carts.length < limit) break
    offset += limit
  }

  if (totalSent > 0) {
    logger.info(`Sent ${totalSent} abandoned cart notification(s)`)
  }
}

export const config = {
  name: "send-abandoned-cart-notification",
  schedule: "0 10 * * *", // Daily at 10am UTC
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/backend/src/jobs/send-abandoned-cart-notification.ts
git commit -m "feat: add abandoned cart scheduled job (daily at 10am UTC)"
```

---

### Task 7: Abandoned Cart — workflow and step

**Files:**
- Create: `apps/backend/src/workflows/send-abandoned-carts.ts`
- Create: `apps/backend/src/workflows/steps/send-abandoned-notifications.ts`

- [ ] **Step 1: Create the notification step**

```typescript
// apps/backend/src/workflows/steps/send-abandoned-notifications.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type StepInput = {
  carts: any[]
}

export const sendAbandonedNotificationsStep = createStep(
  "send-abandoned-notifications",
  async ({ carts }: StepInput, { container }) => {
    const notificationModuleService = container.resolve(Modules.NOTIFICATION)

    const notifications = carts.map((cart) => ({
      to: cart.email,
      channel: "email" as const,
      template: "abandoned-cart",
      data: {
        emailOptions: {
          subject: "You left something behind",
          replyTo: "hello@calilean.com",
        },
        customer_name: cart.customer?.first_name || "",
        cart_id: cart.id,
        items: (cart.items || []).map((item: any) => ({
          title: item.variant?.product?.title || item.title,
          variant_title: item.variant?.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          thumbnail: item.variant?.product?.thumbnail || item.thumbnail,
        })),
      },
    }))

    const created = await notificationModuleService.createNotifications(
      notifications
    )

    return new StepResponse(created)
  }
)
```

- [ ] **Step 2: Create the workflow**

```typescript
// apps/backend/src/workflows/send-abandoned-carts.ts
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateCartsStep } from "@medusajs/medusa/core-flows"
import { sendAbandonedNotificationsStep } from "./steps/send-abandoned-notifications"

type WorkflowInput = {
  carts: any[]
}

export const sendAbandonedCartsWorkflow = createWorkflow(
  "send-abandoned-carts",
  ({ carts }: WorkflowInput) => {
    sendAbandonedNotificationsStep({ carts })

    const cartUpdates = transform({ carts }, ({ carts }) =>
      carts.map((cart: any) => ({
        id: cart.id,
        metadata: {
          ...cart.metadata,
          abandoned_notification: new Date().toISOString(),
        },
      }))
    )

    updateCartsStep(cartUpdates)

    return new WorkflowResponse({ carts })
  }
)
```

- [ ] **Step 3: Create the abandoned-cart email template**

```typescript
// packages/plugin-email/src/providers/email-notifications/templates/abandoned-cart.tsx
import { Button, Section, Text, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { BRAND, COLORS } from "../lib/brand"

export const ABANDONED_CART = "abandoned-cart"

export interface AbandonedCartTemplateProps {
  customer_name?: string
  cart_id?: string
  items?: Array<{
    title?: string
    variant_title?: string
    quantity?: number
    unit_price?: number
    thumbnail?: string
  }>
  preview?: string
}

export const isAbandonedCartData = (
  data: any
): data is AbandonedCartTemplateProps => true // All fields optional

export const AbandonedCartTemplate: React.FC<AbandonedCartTemplateProps> & {
  PreviewProps: AbandonedCartTemplateProps
} = ({
  customer_name,
  items = [],
  preview = "You left something behind.",
}) => {
  return (
    <Base preview={preview}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: COLORS.ink,
          margin: "0 0 16px",
          letterSpacing: "-0.01em",
        }}
      >
        Still thinking it over?
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: "24px",
          color: COLORS.ink,
          margin: "0 0 8px",
        }}
      >
        {customer_name ? `Hey ${customer_name}, you` : "You"} left
        {items.length === 1 ? " an item" : " some items"} in your cart.
        {items.length > 0 ? " Here's what's waiting:" : ""}
      </Text>

      {items.length > 0 && (
        <>
          <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />
          {items.map((item, i) => (
            <Text
              key={i}
              style={{
                fontSize: 14,
                lineHeight: "22px",
                color: COLORS.ink,
                margin: "0 0 4px",
              }}
            >
              {item.title}
              {item.variant_title ? ` — ${item.variant_title}` : ""} x{" "}
              {item.quantity || 1}
            </Text>
          ))}
        </>
      )}

      <Section style={{ margin: "28px 0" }}>
        <Button
          href={`${BRAND.url}/store`}
          style={{
            backgroundColor: COLORS.ink,
            borderRadius: 9,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            padding: "14px 24px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Return to store
        </Button>
      </Section>

      <Text style={{ fontSize: 14, color: COLORS.fog, margin: "16px 0 0" }}>
        {BRAND.signoff}
      </Text>
    </Base>
  )
}

AbandonedCartTemplate.PreviewProps = {
  customer_name: "Alex",
  items: [
    { title: "BPC-157 5mg", variant_title: "5mg vial", quantity: 2 },
    { title: "TB-500 5mg", variant_title: "5mg vial", quantity: 1 },
  ],
}

export default AbandonedCartTemplate
```

- [ ] **Step 4: Register the template in the index**

Add to `packages/plugin-email/src/providers/email-notifications/templates/index.tsx`:

Import at the top:
```typescript
import { AbandonedCartTemplate, ABANDONED_CART, isAbandonedCartData } from './abandoned-cart'
```

Add to `EmailTemplates`:
```typescript
export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  PASSWORD_RESET,
  SHIPPING_CONFIRMATION,
  REFUND_CONFIRMATION,
  ABANDONED_CART,
} as const
```

Add case to `generateEmailTemplate` switch before `default`:
```typescript
    case EmailTemplates.ABANDONED_CART:
      if (!isAbandonedCartData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ABANDONED_CART}"`
        )
      }
      element = <AbandonedCartTemplate {...data} />
      break
```

Add to exports:
```typescript
export { InviteUserEmail, OrderPlacedTemplate, PasswordResetTemplate, ShippingConfirmationTemplate, RefundConfirmationTemplate, AbandonedCartTemplate }
```

- [ ] **Step 5: Rebuild the email plugin**

```bash
cd packages/plugin-email && pnpm build
```

Expected: `Plugin build completed successfully`

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/workflows/ apps/backend/src/jobs/ packages/plugin-email/src/providers/email-notifications/templates/
git commit -m "feat: add abandoned cart workflow, job, and email template"
```

---

### Task 8: Rebuild all plugins and verify

- [ ] **Step 1: Rebuild all modified plugins**

```bash
cd packages/plugin-invoices && pnpm build
cd ../plugin-loyalty && pnpm build
cd ../plugin-email && pnpm build
```

All should output: `Plugin build completed successfully`

- [ ] **Step 2: Start backend and verify no startup errors**

```bash
cd apps/backend && pnpm dev
```

Check logs for:
- No subscriber loading errors
- `order.placed` shows 2+ subscribers (invoice + loyalty)
- Abandoned cart job registered

- [ ] **Step 3: Push to GitHub**

```bash
git push origin master
```

---

## Summary of Changes

| Plugin | What's Added | Files |
|--------|-------------|-------|
| plugin-invoices | order-placed subscriber (PDF + email), order-updated subscriber (mark stale) | 2 new |
| plugin-loyalty | order-placed subscriber (award points), complete-cart hook (validate points) | 2 new |
| plugin-email | abandoned-cart email template | 1 new, 1 modified |
| All 8 plugins | jest.config.js, integration-tests/setup.js, health.spec.ts, test scripts | 24 new, 8 modified |
| Backend | Abandoned cart job + workflow + step | 3 new |
