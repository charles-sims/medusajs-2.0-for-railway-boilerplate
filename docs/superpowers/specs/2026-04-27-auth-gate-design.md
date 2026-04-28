# CaliLean Auth Gate — Design Spec

**Date:** 2026-04-27
**Status:** Approved
**Approach:** Middleware auth guard with standalone gate page

---

## 1. Overview

Gate the entire storefront behind authentication. Users must log in or create an account before seeing any content. The gate page is branded but intentionally vague — no mention of peptides, research compounds, or product specifics.

**Why:** Compliance risk mitigation. Payment processor and platform scrutiny is lower when product pages are behind authentication. The auth gate also replaces the existing 21+ age gate with a stronger mechanism (attestation tied to a real account).

---

## 2. Gate Page

### Route
`storefront/src/app/gate/page.tsx` — lives outside `[countryCode]/(main)/` so it renders without nav, footer, or announcement bar.

### Layout
Full-viewport white page, vertically centered content:
- CaliLean logo (black variant, large)
- Tagline: "Sequenced for results." (`text-calilean-fog`)
- Heading: "Enter." (`text-calilean-ink`, bold, large)
- Login/Register form toggle

### Login Form
- Email input
- Password input
- "Sign in" button (`bg-calilean-pacific text-white`)
- "New here? Create an account" link to toggle to register view

### Register Form
- First name, last name inputs (row)
- Email input
- Phone input
- Password input
- Checkbox (required): "I confirm I am 21 or older and agree to the Terms of Service."
- "Create account" button (`bg-calilean-pacific text-white`)
- "Already have an account? Sign in" link to toggle back

### Auth Actions
- Login: calls existing `login()` server action from `lib/data/customer.ts`
- Register: calls existing `signup()` server action from `lib/data/customer.ts`
- On success: redirect to `/{countryCode}/` (homepage)
- On error: show error message inline below form

### Styling
- Background: white (`bg-calilean-bg`)
- All inputs: `bg-calilean-sand` with `rounded-btn`
- Button: `bg-calilean-pacific text-white rounded-btn`
- Font: Plus Jakarta Sans (inherits from root layout)
- Max width form container: 380px, centered

---

## 3. Middleware Auth Guard

### File
`storefront/src/middleware.ts`

### Logic
Add auth check at the top of the existing middleware function, before region routing:

1. Extract request path
2. If path matches a public route → skip auth check, continue to region routing
3. Check for `_medusa_jwt` cookie
4. If no cookie → `NextResponse.redirect("/gate")`
5. If cookie exists → continue to existing region routing logic

### Public Routes (no auth required)
- `/gate` — the auth gate page
- `/_next/*` — Next.js internals (static files, HMR, etc.)
- `/favicon*` — favicons
- `/brand/*` — logo and product images
- `/site.webmanifest` — web manifest
- Any path with a file extension (`.jpg`, `.png`, `.css`, `.js`, `.ico`, `.svg`, `.woff2`)

### Protected Routes (auth required)
Everything else — homepage, store, products, cart, checkout, account.

---

## 4. Age Gate Removal

### Remove from root layout
- Remove `<AgeGate />` from `storefront/src/app/layout.tsx`
- Remove the `import AgeGate from "@modules/calilean/components/age-gate"` import

### Merge attestation into registration
- Add required checkbox to register form: "I confirm I am 21 or older and agree to the Terms of Service."
- Client-side validation: form submission blocked if unchecked
- The attestation is now tied to a named account (email + name) — stronger than anonymous sessionStorage

### Cleanup
- The age gate component file (`storefront/src/modules/calilean/components/age-gate/index.tsx`) can remain in the codebase but is no longer imported or rendered
- The `sessionStorage.age-verified` key is no longer used

---

## 5. Account Page Adjustments

### @login slot redirect
Current: `@login` parallel route renders a full login form at `/account`.
New: `@login` slot redirects to `/gate` instead. This avoids two separate login UIs.

Implementation: Replace the content of `storefront/src/app/[countryCode]/(main)/account/@login/page.tsx` with a redirect to `/gate`.

### @dashboard slot
No changes. Works as-is — user is always authenticated when they reach it.

### Logout flow
Current: `signout()` in `lib/data/customer.ts` calls `removeAuthToken()` then `redirect("/{countryCode}/account")`.
New: `signout()` calls `removeAuthToken()` then `redirect("/gate")`.

---

## 6. Cookie & Persistence

No new cookies. Existing mechanism handles everything:

| Cookie | Purpose | Expiry |
|---|---|---|
| `_medusa_jwt` | Auth token — middleware checks for presence | 7 days |
| `_medusa_cart_id` | Cart session | 7 days |

### User experience flow
1. First visit → no JWT → middleware redirects to `/gate`
2. User registers or logs in → JWT cookie set → redirect to homepage
3. Return visit (within 7 days) → JWT exists → homepage loads directly
4. After 7 days → JWT expires → middleware redirects to `/gate`
5. Logout → JWT removed → redirect to `/gate`

---

## 7. Files Changed

### New files
- `storefront/src/app/gate/page.tsx` — gate page with login/register forms
- `storefront/src/app/gate/layout.tsx` — minimal layout (no nav/footer, just font vars)

### Modified files
- `storefront/src/middleware.ts` — add auth guard logic
- `storefront/src/app/layout.tsx` — remove AgeGate import and render
- `storefront/src/lib/data/customer.ts` — change signout redirect to `/gate`
- `storefront/src/app/[countryCode]/(main)/account/@login/page.tsx` — redirect to `/gate`

### Untouched files
- `storefront/src/lib/data/cookies.ts` — no changes
- `storefront/src/lib/config.ts` — no changes
- `storefront/src/modules/account/components/login/index.tsx` — not reused (gate has own form)
- `storefront/src/modules/account/components/register/index.tsx` — not reused (gate has own form)

---

## 8. Out of Scope

- Social login (Google, Apple) — not supported by current Medusa setup
- Email verification on registration — not currently implemented, separate feature
- Password reset flow — existing flow works, no changes needed
- Rate limiting on login attempts — backend concern, not storefront
- "Remember me" toggle — JWT already persists 7 days by default
- Changing the gate page based on country code — gate is universal
