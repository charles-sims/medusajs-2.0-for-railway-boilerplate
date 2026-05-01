# QR Marketing Attribution System — Design Spec

**Date:** 2026-04-30
**Status:** Approved
**Plugin:** `@calilean/plugin-qr-marketing`

## Overview

QR codes printed on CaliLean peptide pens and product marketing materials that link to the website with full attribution tracking through Segment. Admins create and manage QR campaigns in the Medusa dashboard, each campaign generates a unique short URL (`/store/go/:code`) that redirects to a configurable destination with UTM parameters. Every scan is tracked and attributed through to order conversion.

## Data Model

### `QrCampaign`

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | id | PK, auto | Unique identifier |
| `code` | text | unique, required | Short code for URL, e.g. `PEN-001` |
| `name` | text | required | Human label, e.g. "BPC-157 Pen Insert Q2" |
| `destination_url` | text | required | Redirect target, e.g. `/products/bpc-157-pen` |
| `utm_source` | text | default "qr" | Always "qr" for QR codes |
| `utm_medium` | text | required | e.g. "packaging", "flyer", "event" |
| `utm_campaign` | text | required | e.g. "spring2026", "launch" |
| `utm_content` | text | nullable | Optional A/B differentiator |
| `scan_count` | bigNumber | default 0 | Fast local counter for admin UI |
| `is_active` | boolean | default true | Kill switch without deleting |
| `product_id` | text | nullable | Optional product reference for admin context |
| `notes` | text | nullable | Internal notes |
| `metadata` | json | nullable | Extensible |

No Medusa module links — `product_id` is a display-only reference. Module stays isolated.

## API Routes

### Admin Routes (authenticated)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/admin/qr-campaigns` | List campaigns (paginated, filterable by `is_active`, `utm_medium`) |
| `GET` | `/admin/qr-campaigns/:id` | Get campaign detail + `qr_data_url` (base64 PNG) |
| `POST` | `/admin/qr-campaigns` | Create campaign |
| `POST` | `/admin/qr-campaigns/:id` | Update campaign |
| `DELETE` | `/admin/qr-campaigns/:id` | Delete campaign |

### Store Route (public)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/store/go/:code` | Look up campaign → increment `scan_count` → fire Segment `qr_code.scanned` event → 302 redirect to `destination_url?utm_source=...&utm_medium=...&utm_campaign=...&utm_content=...` |

If campaign not found or inactive, redirect to homepage.

### QR Code Generation

Generated server-side on `GET /admin/qr-campaigns/:id` using `qrcode.toDataURL()`. The QR encodes `https://calilean.com/store/go/{code}`. Returned as a `qr_data_url` field in the response. Admin UI renders it inline and offers a download button.

## Admin UI

### List View (`/admin/qr-marketing`)

- Sidebar entry: "QR Marketing" with icon
- Table columns: Name, Code, Destination, Medium, Campaign, Scans, Status (active/inactive badge)
- "Create" button in header
- Search by name/code
- Filter by `is_active`, `utm_medium`

### Create/Edit Modal

- **Name**: text input
- **Code**: text input, auto-suggested from name (e.g. "BPC-157 Pen Insert" → `BPC-157-PEN-INSERT`)
- **Destination URL**: text input (manual URL or path like `/products/bpc-157-pen`)
- **UTM Medium**: select dropdown (packaging, flyer, event, insert, display, other)
- **UTM Campaign**: text input
- **UTM Content**: text input (optional)
- **Notes**: textarea (optional)
- `utm_source` hardcoded to "qr" — not shown in form

### Detail View (`/admin/qr-marketing/:id`)

- Campaign info card with all fields
- QR code preview (rendered from `qr_data_url`)
- Download QR button (PNG)
- Scan count badge
- Edit / Deactivate / Delete actions

Built with `@medusajs/ui` components (Container, Table, Heading, Badge, Button, Input, Select, Label).

## Attribution Flow

### Segment Events

**Event 1: `qr_code.scanned`** — fired on every scan from the store redirect route.

```json
{
  "event": "qr_code.scanned",
  "properties": {
    "campaign_code": "PEN-001",
    "campaign_name": "BPC-157 Pen Insert Q2",
    "destination_url": "/products/bpc-157-pen",
    "utm_source": "qr",
    "utm_medium": "packaging",
    "utm_campaign": "spring2026",
    "user_agent": "Mozilla/5.0...",
    "referer": null
  }
}
```

No `actor_id` — scanner is anonymous. Segment handles anonymous tracking.

**Event 2: `order_placed` (enriched)** — fired by order subscriber with attribution data.

```json
{
  "event": "order_placed",
  "actor_id": "cus_01KK...",
  "properties": {
    "order_id": "order_01KK...",
    "total": 89.99,
    "attribution": {
      "source": "qr",
      "medium": "packaging",
      "campaign": "spring2026",
      "content": null,
      "campaign_code": "PEN-001"
    }
  }
}
```

### Cookie Lifecycle

1. User scans QR → redirected with UTMs → storefront middleware writes `__cl_attribution` cookie (JSON, 30-day expiry, first-touch — does not overwrite if already set)
2. During checkout, storefront passes cookie value as `metadata.attribution` on the cart
3. `order.placed` subscriber reads `order.metadata.attribution` and fires enriched Segment event

## Plugin Structure

```
packages/plugin-qr-marketing/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                          # Plugin entry
│   ├── modules/
│   │   └── qr-marketing/
│   │       ├── index.ts                  # Module definition
│   │       ├── models/
│   │       │   └── qr-campaign.ts        # Data model
│   │       └── service.ts                # MedusaService (free CRUD)
│   ├── api/
│   │   ├── admin/
│   │   │   └── qr-campaigns/
│   │   │       ├── route.ts              # GET (list), POST (create)
│   │   │       ├── middlewares.ts         # Zod validation
│   │   │       └── [id]/
│   │   │           └── route.ts          # GET (detail+QR), POST (update), DELETE
│   │   └── store/
│   │       └── go/
│   │           └── [code]/
│   │               └── route.ts          # GET → track + redirect
│   ├── workflows/
│   │   └── steps/
│   │       └── track-qr-scan.ts          # Segment tracking step
│   └── admin/
│       └── routes/
│           └── qr-marketing/
│               ├── page.tsx              # List view (sidebar entry)
│               └── [id]/
│                   └── page.tsx          # Detail view
```

## Dependencies

**New:**
- `qrcode` — QR image generation
- `@types/qrcode` — TypeScript types

**Reused:**
- `@medusajs/framework` — module, service, API route infrastructure
- `@medusajs/ui` — admin components
- `@medusajs/admin-sdk` — route/widget config
- Analytics Module (Segment provider) — `qr_code.scanned` and enriched `order_placed` events

## Storefront Changes (`apps/storefront`)

1. **`middleware.ts`** — add UTM capture: when query params contain `utm_source`, write `__cl_attribution` cookie (JSON, 30-day, first-touch)
2. **Cart creation** — read `__cl_attribution` cookie and pass as `metadata.attribution` on cart

## Medusa Config Changes (`apps/backend/medusa-config.ts`)

- Add `./src/modules/qr-marketing` to modules array (or resolve from plugin)
- Add `@calilean/plugin-qr-marketing` to plugins array

## What We Reuse

- Segment analytics provider (already configured) — no new analytics code
- `MedusaService` factory — free CRUD for the data model
- Admin UI patterns from existing plugins (plugin-reviews, plugin-subscription)
- `qrcode` package from Medusa's ticket-booking recipe
- Cart/order metadata fields for UTM persistence
