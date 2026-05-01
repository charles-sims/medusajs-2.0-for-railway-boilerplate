# QR Marketing Attribution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `@calilean/plugin-qr-marketing` plugin that lets admins create QR campaigns, tracks scans via Segment, and attributes orders back to the originating QR code.

**Architecture:** Medusa plugin with a custom module (`qrMarketing`) containing a `QrCampaign` data model, admin/store API routes, and an admin UI page. The storefront middleware captures UTM params from QR redirects into a cookie, which is attached to carts as metadata and forwarded to Segment on order placement.

**Tech Stack:** Medusa 2.14, TypeScript, `qrcode` (npm), `@medusajs/ui` + `@medusajs/admin-sdk` for admin UI, Segment analytics (existing provider).

---

## File Map

```
packages/plugin-qr-marketing/
├── package.json
├── tsconfig.json
├── jest.config.js
├── src/
│   ├── index.ts                                    # Re-exports module constant
│   ├── modules/
│   │   └── qr-marketing/
│   │       ├── index.ts                            # Module definition
│   │       ├── models/
│   │       │   └── qr-campaign.ts                  # QrCampaign data model
│   │       └── service.ts                          # MedusaService + incrementScanCount
│   ├── api/
│   │   ├── middlewares.ts                          # Zod schemas + middleware config
│   │   ├── admin/
│   │   │   └── qr-campaigns/
│   │   │       ├── route.ts                        # GET (list), POST (create)
│   │   │       └── [id]/
│   │   │           └── route.ts                    # GET (detail+QR), POST (update), DELETE
│   │   └── store/
│   │       └── go/
│   │           └── [code]/
│   │               └── route.ts                    # GET → track scan + 302 redirect
│   └── admin/
│       ├── lib/
│       │   └── sdk.ts                              # Medusa JS SDK instance
│       └── routes/
│           └── qr-marketing/
│               ├── page.tsx                        # List view (sidebar entry)
│               └── [id]/
│                   └── page.tsx                    # Detail view + QR preview
apps/storefront/src/middleware.ts                    # Add UTM → cookie capture
apps/storefront/src/lib/data/cart.ts                 # Pass attribution cookie to cart metadata
apps/backend/medusa-config.ts                        # Register module + plugin
```

---

### Task 1: Scaffold Plugin Package

**Files:**
- Create: `packages/plugin-qr-marketing/package.json`
- Create: `packages/plugin-qr-marketing/tsconfig.json`
- Create: `packages/plugin-qr-marketing/jest.config.js`
- Create: `packages/plugin-qr-marketing/src/admin/.gitkeep`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@calilean/plugin-qr-marketing",
  "version": "0.1.0",
  "private": true,
  "description": "QR code marketing attribution plugin for CaliLean",
  "files": [".medusa/server"],
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
    "test": "jest",
    "test:integration": "TEST_TYPE=integration:http jest --runInBand",
    "test:unit": "TEST_TYPE=unit jest",
    "prepublishOnly": "medusa plugin:build"
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
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.2.25",
    "prop-types": "^15.8.1",
    "qrcode": "^1.5.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.14.2",
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
    "lib": ["es2021", "DOM"],
    "target": "es2021",
    "outDir": "./dist",
    "esModuleInterop": true,
    "declaration": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "sourceMap": false,
    "noEmit": true,
    "strictNullChecks": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "paths": {
      "@medusajs/framework/types": ["../../node_modules/@medusajs/framework/dist/types"],
      "@medusajs/framework/*": ["../../node_modules/@medusajs/framework/dist/*"]
    }
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", ".medusa", "**/*.spec.ts"]
}
```

- [ ] **Step 3: Create jest.config.js**

```js
const { loadEnv, Directives } = require("@medusajs/framework/utils")
loadEnv("test", process.cwd())
module.exports = {
  transform: { "^.+\\.[jt]s?$": ["@swc/jest"] },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
}
```

- [ ] **Step 4: Create admin gitkeep**

Create empty file at `packages/plugin-qr-marketing/src/admin/.gitkeep`.

- [ ] **Step 5: Install dependencies**

Run: `cd packages/plugin-qr-marketing && pnpm install`

- [ ] **Step 6: Commit**

```bash
git add packages/plugin-qr-marketing/package.json packages/plugin-qr-marketing/tsconfig.json packages/plugin-qr-marketing/jest.config.js packages/plugin-qr-marketing/src/admin/.gitkeep
git commit -m "chore: scaffold @calilean/plugin-qr-marketing package"
```

---

### Task 2: Data Model + Module + Service

**Files:**
- Create: `packages/plugin-qr-marketing/src/modules/qr-marketing/models/qr-campaign.ts`
- Create: `packages/plugin-qr-marketing/src/modules/qr-marketing/service.ts`
- Create: `packages/plugin-qr-marketing/src/modules/qr-marketing/index.ts`
- Create: `packages/plugin-qr-marketing/src/index.ts`

- [ ] **Step 1: Create the QrCampaign data model**

```typescript
// packages/plugin-qr-marketing/src/modules/qr-marketing/models/qr-campaign.ts
import { model } from "@medusajs/framework/utils"

const QrCampaign = model.define("qr_campaign", {
  id: model.id().primaryKey(),
  code: model.text().unique(),
  name: model.text(),
  destination_url: model.text(),
  utm_source: model.text().default("qr"),
  utm_medium: model.text(),
  utm_campaign: model.text(),
  utm_content: model.text().nullable(),
  scan_count: model.bigNumber().default(0),
  is_active: model.boolean().default(true),
  product_id: model.text().nullable(),
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default QrCampaign
```

- [ ] **Step 2: Create the service**

```typescript
// packages/plugin-qr-marketing/src/modules/qr-marketing/service.ts
import { InjectManager, MedusaService, MedusaContext } from "@medusajs/framework/utils"
import QrCampaign from "./models/qr-campaign"
import { Context } from "@medusajs/framework/types"
import { EntityManager } from "@medusajs/framework/mikro-orm/knex"

class QrMarketingModuleService extends MedusaService({
  QrCampaign,
}) {
  @InjectManager()
  async incrementScanCount(
    code: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<void> {
    await sharedContext?.manager?.execute(
      `UPDATE qr_campaign SET scan_count = scan_count + 1 WHERE code = ?`,
      [code]
    )
  }
}

export default QrMarketingModuleService
```

- [ ] **Step 3: Create the module definition**

```typescript
// packages/plugin-qr-marketing/src/modules/qr-marketing/index.ts
import { Module } from "@medusajs/framework/utils"
import QrMarketingModuleService from "./service"

export const QR_MARKETING_MODULE = "qrMarketing"

export default Module(QR_MARKETING_MODULE, {
  service: QrMarketingModuleService,
})
```

- [ ] **Step 4: Create the plugin entry point**

```typescript
// packages/plugin-qr-marketing/src/index.ts
export { QR_MARKETING_MODULE } from "./modules/qr-marketing"
```

- [ ] **Step 5: Commit**

```bash
git add packages/plugin-qr-marketing/src/modules packages/plugin-qr-marketing/src/index.ts
git commit -m "feat(qr-marketing): add QrCampaign data model, service, and module definition"
```

---

### Task 3: Register Plugin in Backend

**Files:**
- Modify: `apps/backend/medusa-config.ts`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: Add workspace dependency to backend package.json**

Add to `dependencies` in `apps/backend/package.json`:

```json
"@calilean/plugin-qr-marketing": "workspace:*"
```

- [ ] **Step 2: Add module and plugin to medusa-config.ts**

In the `modules` array, add:

```typescript
// QR Marketing Module
{
  resolve: "./src/modules/qr-marketing",
},
```

Wait — this is a plugin, not a local module. The module is inside the plugin. Add `@calilean/plugin-qr-marketing` to the `plugins` array alongside the existing plugins:

```typescript
plugins: [
  "@calilean/plugin-email",
  "@calilean/plugin-loyalty",
  "@calilean/plugin-reviews",
  "@calilean/plugin-invoices",
  "@calilean/plugin-bundles",
  "@calilean/plugin-shipstation",
  "@calilean/plugin-subscription",
  "@calilean/plugin-preorder",
  "@calilean/plugin-qr-marketing",
  // ...rest
]
```

- [ ] **Step 3: Run pnpm install from repo root**

Run: `pnpm install` (from repo root to link the workspace dependency)

- [ ] **Step 4: Generate and run migrations**

Run: `cd apps/backend && npx medusa db:generate qrMarketing && npx medusa db:migrate`

- [ ] **Step 5: Build the plugin to verify**

Run: `cd packages/plugin-qr-marketing && pnpm build`

Expected: Build completes successfully.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/medusa-config.ts apps/backend/package.json pnpm-lock.yaml packages/plugin-qr-marketing
git commit -m "feat(qr-marketing): register plugin in backend config and run migrations"
```

---

### Task 4: Admin API Routes

**Files:**
- Create: `packages/plugin-qr-marketing/src/api/middlewares.ts`
- Create: `packages/plugin-qr-marketing/src/api/admin/qr-campaigns/route.ts`
- Create: `packages/plugin-qr-marketing/src/api/admin/qr-campaigns/[id]/route.ts`

- [ ] **Step 1: Create Zod schemas and middleware**

```typescript
// packages/plugin-qr-marketing/src/api/middlewares.ts
import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetQrCampaignsSchema = createFindParams()

export const PostQrCampaignSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1),
  destination_url: z.string().min(1),
  utm_source: z.string().default("qr"),
  utm_medium: z.string().min(1),
  utm_campaign: z.string().min(1),
  utm_content: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  product_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type PostQrCampaignSchemaType = z.infer<typeof PostQrCampaignSchema>

export const PostQrCampaignUpdateSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).optional(),
  destination_url: z.string().min(1).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().min(1).optional(),
  utm_campaign: z.string().min(1).optional(),
  utm_content: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  product_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type PostQrCampaignUpdateSchemaType = z.infer<typeof PostQrCampaignUpdateSchema>

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/qr-campaigns",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetQrCampaignsSchema, {
          isList: true,
          defaults: [
            "id", "code", "name", "destination_url",
            "utm_source", "utm_medium", "utm_campaign", "utm_content",
            "scan_count", "is_active", "product_id", "notes",
            "created_at", "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/qr-campaigns",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostQrCampaignSchema),
      ],
    },
    {
      matcher: "/admin/qr-campaigns/:id",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetQrCampaignsSchema, {
          isList: false,
          defaults: [
            "id", "code", "name", "destination_url",
            "utm_source", "utm_medium", "utm_campaign", "utm_content",
            "scan_count", "is_active", "product_id", "notes",
            "created_at", "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/qr-campaigns/:id",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostQrCampaignUpdateSchema),
      ],
    },
  ],
})
```

- [ ] **Step 2: Create list + create route**

```typescript
// packages/plugin-qr-marketing/src/api/admin/qr-campaigns/route.ts
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QR_MARKETING_MODULE } from "../../../modules/qr-marketing"
import QrMarketingModuleService from "../../../modules/qr-marketing/service"
import { PostQrCampaignSchemaType } from "../../middlewares"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")

  const {
    data: qr_campaigns,
    metadata: { count, take, skip } = { count: 0, take: 20, skip: 0 },
  } = await query.graph({
    entity: "qr_campaign",
    ...req.queryConfig,
  })

  res.json({
    qr_campaigns,
    count,
    limit: take,
    offset: skip,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostQrCampaignSchemaType>,
  res: MedusaResponse
) => {
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  const qr_campaign = await service.createQrCampaigns(req.validatedBody)

  res.status(201).json({ qr_campaign })
}
```

- [ ] **Step 3: Create detail + update + delete route**

```typescript
// packages/plugin-qr-marketing/src/api/admin/qr-campaigns/[id]/route.ts
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QR_MARKETING_MODULE } from "../../../../modules/qr-marketing"
import QrMarketingModuleService from "../../../../modules/qr-marketing/service"
import { PostQrCampaignUpdateSchemaType } from "../../../middlewares"
import QRCode from "qrcode"

const STORE_URL = process.env.BACKEND_PUBLIC_URL || "https://admin.calilean.com"
const STOREFRONT_URL = process.env.STOREFRONT_URL || "https://calilean.com"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  const qr_campaign = await service.retrieveQrCampaign(id)

  const qrUrl = `${STOREFRONT_URL}/store/go/${qr_campaign.code}`
  const qr_data_url = await QRCode.toDataURL(qrUrl, {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  })

  res.json({ qr_campaign, qr_data_url, qr_url: qrUrl })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostQrCampaignUpdateSchemaType>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  const qr_campaign = await service.updateQrCampaigns({
    id,
    ...req.validatedBody,
  })

  res.json({ qr_campaign })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  await service.deleteQrCampaigns(id)

  res.json({ id, object: "qr_campaign", deleted: true })
}
```

- [ ] **Step 4: Build to verify**

Run: `cd packages/plugin-qr-marketing && pnpm build`

Expected: Build completes. If there are import issues with `qrcode`, ensure the package is installed.

- [ ] **Step 5: Commit**

```bash
git add packages/plugin-qr-marketing/src/api
git commit -m "feat(qr-marketing): add admin API routes for CRUD + QR code generation"
```

---

### Task 5: Store Redirect Route (Scan Tracking)

**Files:**
- Create: `packages/plugin-qr-marketing/src/api/store/go/[code]/route.ts`

- [ ] **Step 1: Create the redirect + tracking route**

```typescript
// packages/plugin-qr-marketing/src/api/store/go/[code]/route.ts
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QR_MARKETING_MODULE } from "../../../../modules/qr-marketing"
import QrMarketingModuleService from "../../../../modules/qr-marketing/service"
import { Modules } from "@medusajs/framework/utils"

const STOREFRONT_URL = process.env.STOREFRONT_URL || "https://calilean.com"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { code } = req.params
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  let campaign
  try {
    const campaigns = await service.listQrCampaigns({ code })
    campaign = campaigns[0]
  } catch {
    // Campaign not found — redirect to homepage
    return res.redirect(302, STOREFRONT_URL)
  }

  if (!campaign || !campaign.is_active) {
    return res.redirect(302, STOREFRONT_URL)
  }

  // Increment scan count (fire and forget)
  service.incrementScanCount(code).catch(() => {})

  // Track scan via Segment analytics (fire and forget)
  try {
    const analyticsService = req.scope.resolve(Modules.ANALYTICS)
    analyticsService.track({
      event: "qr_code.scanned",
      properties: {
        campaign_code: campaign.code,
        campaign_name: campaign.name,
        destination_url: campaign.destination_url,
        utm_source: campaign.utm_source,
        utm_medium: campaign.utm_medium,
        utm_campaign: campaign.utm_campaign,
        utm_content: campaign.utm_content,
        user_agent: req.headers["user-agent"] || "",
        referer: req.headers["referer"] || "",
      },
    }).catch(() => {})
  } catch {
    // Analytics module may not be configured — continue
  }

  // Build redirect URL with UTM params
  const dest = campaign.destination_url.startsWith("http")
    ? campaign.destination_url
    : `${STOREFRONT_URL}${campaign.destination_url}`

  const url = new URL(dest)
  url.searchParams.set("utm_source", campaign.utm_source)
  url.searchParams.set("utm_medium", campaign.utm_medium)
  url.searchParams.set("utm_campaign", campaign.utm_campaign)
  if (campaign.utm_content) {
    url.searchParams.set("utm_content", campaign.utm_content)
  }
  url.searchParams.set("qr_code", campaign.code)

  return res.redirect(302, url.toString())
}
```

- [ ] **Step 2: Build to verify**

Run: `cd packages/plugin-qr-marketing && pnpm build`

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-qr-marketing/src/api/store
git commit -m "feat(qr-marketing): add store redirect route with scan tracking and Segment event"
```

---

### Task 6: Storefront UTM Cookie Capture

**Files:**
- Modify: `apps/storefront/src/middleware.ts`

- [ ] **Step 1: Add UTM capture to middleware**

After the auth gate section (after line 128 `// --- End auth gate ---`) and before the `searchParams` block (line 130), add UTM capture logic:

```typescript
  // --- UTM Attribution capture ---
  const utmSource = request.nextUrl.searchParams.get("utm_source")
  if (utmSource && !request.cookies.get("__cl_attribution")) {
    // Build response later — just prepare the attribution data
    const attribution = JSON.stringify({
      source: utmSource,
      medium: request.nextUrl.searchParams.get("utm_medium") || "",
      campaign: request.nextUrl.searchParams.get("utm_campaign") || "",
      content: request.nextUrl.searchParams.get("utm_content") || "",
      campaign_code: request.nextUrl.searchParams.get("qr_code") || "",
      landed_at: new Date().toISOString(),
    })
    // We'll set this cookie on the response object below
    // Store it so we can attach after the response is built
    request.headers.set("x-cl-attribution", attribution)
  }
  // --- End UTM Attribution ---
```

Then, before the final `return response` at the end of the middleware function, add:

```typescript
  // Attach attribution cookie if captured
  const pendingAttribution = request.headers.get("x-cl-attribution")
  if (pendingAttribution) {
    response.cookies.set("__cl_attribution", pendingAttribution, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    })
  }
```

- [ ] **Step 2: Verify middleware still compiles**

Run: `cd apps/storefront && pnpm lint`

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/src/middleware.ts
git commit -m "feat(storefront): capture UTM params from QR redirects into attribution cookie"
```

---

### Task 7: Pass Attribution to Cart Metadata

**Files:**
- Modify: `apps/storefront/src/lib/data/cart.ts`

- [ ] **Step 1: Add attribution to cart creation**

In `getOrSetCart()`, after the cart is created (after line 53 `await setCartId(cart.id)`), add:

```typescript
    // Attach QR attribution if present
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const attributionCookie = cookieStore.get("__cl_attribution")
    if (attributionCookie?.value) {
      try {
        const attribution = JSON.parse(attributionCookie.value)
        await sdk.store.cart.update(
          cart.id,
          { metadata: { attribution } },
          {},
          await getAuthHeaders()
        )
      } catch {
        // Invalid cookie — skip
      }
    }
```

- [ ] **Step 2: Verify lint passes**

Run: `cd apps/storefront && pnpm lint`

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/src/lib/data/cart.ts
git commit -m "feat(storefront): attach QR attribution metadata to new carts"
```

---

### Task 8: Order Attribution Subscriber

**Files:**
- Create: `packages/plugin-qr-marketing/src/subscribers/order-attribution.ts`

- [ ] **Step 1: Create subscriber**

```typescript
// packages/plugin-qr-marketing/src/subscribers/order-attribution.ts
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function handleOrderAttribution({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "total", "metadata"],
    filters: { id: data.id },
  })

  if (!order?.metadata?.attribution) {
    return
  }

  const attribution = order.metadata.attribution as {
    source: string
    medium: string
    campaign: string
    content: string
    campaign_code: string
  }

  try {
    const analyticsService = container.resolve(Modules.ANALYTICS)
    await analyticsService.track({
      event: "order_placed",
      actor_id: order.customer_id || undefined,
      properties: {
        order_id: order.id,
        total: order.total,
        attribution,
      },
    })
  } catch {
    // Analytics module may not be configured
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

- [ ] **Step 2: Build plugin**

Run: `cd packages/plugin-qr-marketing && pnpm build`

- [ ] **Step 3: Commit**

```bash
git add packages/plugin-qr-marketing/src/subscribers
git commit -m "feat(qr-marketing): add order.placed subscriber for attribution tracking via Segment"
```

---

### Task 9: Admin UI — List Page

**Files:**
- Create: `packages/plugin-qr-marketing/src/admin/lib/sdk.ts`
- Create: `packages/plugin-qr-marketing/src/admin/routes/qr-marketing/page.tsx`

- [ ] **Step 1: Create SDK instance**

```typescript
// packages/plugin-qr-marketing/src/admin/lib/sdk.ts
import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: window.location.origin,
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
})
```

- [ ] **Step 2: Create list page**

```tsx
// packages/plugin-qr-marketing/src/admin/routes/qr-marketing/page.tsx
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Crosshair } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  StatusBadge,
  Toaster,
  DataTablePaginationState,
  Button,
} from "@medusajs/ui"
import { useMemo, useState, useEffect, useCallback } from "react"
import { sdk } from "../../lib/sdk"
import { Link } from "react-router-dom"

type QrCampaign = {
  id: string
  code: string
  name: string
  destination_url: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content?: string
  scan_count: number
  is_active: boolean
  product_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

const columnHelper = createDataTableColumnHelper<QrCampaign>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link to={`/qr-marketing/${row.original.id}`} className="text-ui-fg-interactive hover:underline">
        {row.original.name}
      </Link>
    ),
  }),
  columnHelper.accessor("code", {
    header: "Code",
  }),
  columnHelper.accessor("destination_url", {
    header: "Destination",
  }),
  columnHelper.accessor("utm_medium", {
    header: "Medium",
  }),
  columnHelper.accessor("utm_campaign", {
    header: "Campaign",
  }),
  columnHelper.accessor("scan_count", {
    header: "Scans",
    cell: ({ row }) => (
      <StatusBadge color="blue">{String(row.original.scan_count)}</StatusBadge>
    ),
  }),
  columnHelper.accessor("is_active", {
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge color={row.original.is_active ? "green" : "grey"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </StatusBadge>
    ),
  }),
]

const limit = 20

const QrMarketingPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  const [data, setData] = useState<{ qr_campaigns: QrCampaign[]; count: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCampaigns = useCallback(() => {
    setIsLoading(true)
    sdk.client
      .fetch<{ qr_campaigns: QrCampaign[]; count: number }>("/admin/qr-campaigns", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
          order: "-created_at",
        },
      })
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [pagination])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const table = useDataTable({
    columns,
    data: data?.qr_campaigns || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between">
          <Heading>QR Campaigns</Heading>
          <Link to="/qr-marketing/create">
            <Button size="small">Create</Button>
          </Link>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <Toaster />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "QR Marketing",
  icon: Crosshair,
})

export default QrMarketingPage
```

- [ ] **Step 3: Build plugin**

Run: `cd packages/plugin-qr-marketing && pnpm build`

- [ ] **Step 4: Commit**

```bash
git add packages/plugin-qr-marketing/src/admin
git commit -m "feat(qr-marketing): add admin UI list page for QR campaigns"
```

---

### Task 10: Admin UI — Detail Page + Create Page

**Files:**
- Create: `packages/plugin-qr-marketing/src/admin/routes/qr-marketing/[id]/page.tsx`
- Create: `packages/plugin-qr-marketing/src/admin/routes/qr-marketing/create/page.tsx`

- [ ] **Step 1: Create the detail page**

```tsx
// packages/plugin-qr-marketing/src/admin/routes/qr-marketing/[id]/page.tsx
import {
  Container,
  Heading,
  Text,
  Button,
  StatusBadge,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"

type QrCampaign = {
  id: string
  code: string
  name: string
  destination_url: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content?: string
  scan_count: number
  is_active: boolean
  product_id?: string
  notes?: string
  created_at: string
}

type DetailResponse = {
  qr_campaign: QrCampaign
  qr_data_url: string
  qr_url: string
}

const QrCampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<DetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    sdk.client
      .fetch<DetailResponse>(`/admin/qr-campaigns/${id}`)
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [id])

  const handleToggleActive = async () => {
    if (!data) return
    const newStatus = !data.qr_campaign.is_active
    await sdk.client.fetch(`/admin/qr-campaigns/${id}`, {
      method: "POST",
      body: { is_active: newStatus },
    })
    setData({
      ...data,
      qr_campaign: { ...data.qr_campaign, is_active: newStatus },
    })
    toast.success(newStatus ? "Campaign activated" : "Campaign deactivated")
  }

  const handleDelete = async () => {
    await sdk.client.fetch(`/admin/qr-campaigns/${id}`, { method: "DELETE" })
    toast.success("Campaign deleted")
    navigate("/qr-marketing")
  }

  const handleDownloadQR = () => {
    if (!data?.qr_data_url) return
    const link = document.createElement("a")
    link.download = `qr-${data.qr_campaign.code}.png`
    link.href = data.qr_data_url
    link.click()
  }

  if (isLoading) return <Container><Text>Loading...</Text></Container>
  if (!data) return <Container><Text>Campaign not found</Text></Container>

  const { qr_campaign: c, qr_data_url, qr_url } = data

  return (
    <div className="flex flex-col gap-4">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <Heading>{c.name}</Heading>
          <div className="flex gap-2">
            <Button size="small" variant="secondary" onClick={handleToggleActive}>
              {c.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button size="small" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text size="small" className="text-ui-fg-subtle">Code</Text>
            <Text>{c.code}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Status</Text>
            <StatusBadge color={c.is_active ? "green" : "grey"}>
              {c.is_active ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Destination</Text>
            <Text>{c.destination_url}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Scans</Text>
            <StatusBadge color="blue">{String(c.scan_count)}</StatusBadge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">UTM Medium</Text>
            <Text>{c.utm_medium}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">UTM Campaign</Text>
            <Text>{c.utm_campaign}</Text>
          </div>
          {c.utm_content && (
            <div>
              <Text size="small" className="text-ui-fg-subtle">UTM Content</Text>
              <Text>{c.utm_content}</Text>
            </div>
          )}
          {c.notes && (
            <div className="col-span-2">
              <Text size="small" className="text-ui-fg-subtle">Notes</Text>
              <Text>{c.notes}</Text>
            </div>
          )}
        </div>
      </Container>

      <Container>
        <Heading level="h2" className="mb-4">QR Code</Heading>
        <div className="flex items-start gap-6">
          <img src={qr_data_url} alt={`QR code for ${c.code}`} className="w-48 h-48 border rounded" />
          <div className="flex flex-col gap-2">
            <Text size="small" className="text-ui-fg-subtle">Scan URL</Text>
            <Text className="font-mono text-sm">{qr_url}</Text>
            <Button size="small" variant="secondary" onClick={handleDownloadQR}>
              Download PNG
            </Button>
          </div>
        </div>
      </Container>
      <Toaster />
    </div>
  )
}

export default QrCampaignDetailPage
```

- [ ] **Step 2: Create the create page**

```tsx
// packages/plugin-qr-marketing/src/admin/routes/qr-marketing/create/page.tsx
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"

const UTM_MEDIUM_OPTIONS = [
  { value: "packaging", label: "Packaging" },
  { value: "insert", label: "Product Insert" },
  { value: "flyer", label: "Flyer" },
  { value: "event", label: "Event" },
  { value: "display", label: "Display" },
  { value: "other", label: "Other" },
]

const slugify = (text: string) =>
  text.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const CreateQrCampaignPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    code: "",
    destination_url: "",
    utm_medium: "packaging",
    utm_campaign: "",
    utm_content: "",
    notes: "",
  })

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      code: prev.code === slugify(prev.name) || prev.code === "" ? slugify(value) : prev.code,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const body = {
        ...form,
        utm_source: "qr",
        utm_content: form.utm_content || null,
        notes: form.notes || null,
      }
      const res = await sdk.client.fetch<{ qr_campaign: { id: string } }>("/admin/qr-campaigns", {
        method: "POST",
        body,
      })
      toast.success("Campaign created")
      navigate(`/qr-marketing/${res.qr_campaign.id}`)
    } catch {
      toast.error("Failed to create campaign")
      setIsSubmitting(false)
    }
  }

  return (
    <Container>
      <Heading className="mb-6">Create QR Campaign</Heading>
      <div className="flex flex-col gap-4 max-w-lg">
        <div>
          <Label>Name</Label>
          <Input
            placeholder="BPC-157 Pen Insert Q2"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Code</Label>
          <Input
            placeholder="BPC-157-PEN-INSERT-Q2"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          />
        </div>
        <div>
          <Label>Destination URL</Label>
          <Input
            placeholder="/products/bpc-157-pen"
            value={form.destination_url}
            onChange={(e) => setForm((p) => ({ ...p, destination_url: e.target.value }))}
          />
        </div>
        <div>
          <Label>UTM Medium</Label>
          <Select value={form.utm_medium} onValueChange={(v) => setForm((p) => ({ ...p, utm_medium: v }))}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {UTM_MEDIUM_OPTIONS.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div>
          <Label>UTM Campaign</Label>
          <Input
            placeholder="spring2026"
            value={form.utm_campaign}
            onChange={(e) => setForm((p) => ({ ...p, utm_campaign: e.target.value }))}
          />
        </div>
        <div>
          <Label>UTM Content (optional)</Label>
          <Input
            placeholder="variant-a"
            value={form.utm_content}
            onChange={(e) => setForm((p) => ({ ...p, utm_content: e.target.value }))}
          />
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Internal notes about this campaign..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Create Campaign
          </Button>
          <Button variant="secondary" onClick={() => navigate("/qr-marketing")}>
            Cancel
          </Button>
        </div>
      </div>
      <Toaster />
    </Container>
  )
}

export default CreateQrCampaignPage
```

- [ ] **Step 3: Build plugin**

Run: `cd packages/plugin-qr-marketing && pnpm build`

- [ ] **Step 4: Commit**

```bash
git add packages/plugin-qr-marketing/src/admin/routes
git commit -m "feat(qr-marketing): add admin detail page with QR preview and create page"
```

---

### Task 11: Full Build + Backend Verification

**Files:** None new — integration test.

- [ ] **Step 1: Build the full plugin**

Run: `cd packages/plugin-qr-marketing && pnpm build`

Expected: Builds without errors.

- [ ] **Step 2: Build the backend**

Run: `cd apps/backend && pnpm build`

Expected: Backend compiles with plugin loaded. Look for `plugin-qr-marketing` in the output.

- [ ] **Step 3: Verify storefront compiles**

Run: `cd apps/storefront && pnpm lint`

Expected: No lint errors from the middleware or cart changes.

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "feat(qr-marketing): complete QR marketing attribution plugin

Includes:
- QrCampaign data model with scan counting
- Admin CRUD API routes with QR code generation
- Store redirect route with Segment scan tracking
- Admin UI: list, create, and detail pages
- Storefront UTM cookie capture in middleware
- Cart attribution metadata attachment
- order.placed subscriber for Segment conversion attribution"
```

- [ ] **Step 5: Push to trigger Railway deploy**

Run: `git push`
