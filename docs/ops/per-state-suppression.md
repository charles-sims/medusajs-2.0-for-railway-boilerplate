# Per-state checkout suppression — runbook

Pairs with: SKA-25 (state-by-state posture), SKA-27 (warning-letter response
playbook), SKA-28 (this hook).

## What this is

A hot-fix-able env-var-driven block on US-state shipping addresses at
checkout. When a state code is in the deny-list, the storefront rejects
the shipping address before any payment is taken; the backend audits any
order that bypassed the gate.

Day-0 posture (board, 2026-04-26): empty deny-list, ship to all 50 + DC.

## When to use this

Suppress a single state — in **<15 minutes** — when:

- a state attorney general or state board of pharmacy serves a C&D, demand
  letter, or written inquiry naming CaliLean and shipping to that state
  (see `docs/compliance/cease-and-desist-playbook.md`)
- counsel signals that a pending state action is hours, not days, away
- a regulatory tracker (legal newsletter, FDA warning letter to a peer
  brand citing a state) makes a single state high-risk overnight

Do NOT use this for:

- carrier or fulfillment outages (use shipping-method config)
- back-orders or inventory issues (use product/availability)
- general business decisions like tax-nexus avoidance — that needs a
  regular policy decision, not the emergency hook

## How it works

Three env vars. The first two MUST be kept in sync; the third is
backend-only and gates the alert webhook.

| Service    | Var                                  | Notes                                                                  |
| ---------- | ------------------------------------ | ---------------------------------------------------------------------- |
| storefront | `NEXT_PUBLIC_RUO_GEO_DENY_STATES`    | Comma-separated 2-letter US state codes. `NEXT_PUBLIC_` so the inline UI message renders client-side. |
| backend    | `RUO_GEO_DENY_STATES`                | Same value. Drives the order-placed audit subscriber that catches frontend bypasses. |
| backend    | `RUO_GEO_ALERT_WEBHOOK_URL`          | Slack incoming-webhook URL. When set, the audit subscriber posts a `:rotating_light:` message to that channel on every bypass (SKA-29). Unset/blank = no Slack ping (the `logger.error` still fires). |

Format: comma-separated, 2-letter uppercase, no spaces required (we trim).
Empty / unset = allow all. Examples:

```
NEXT_PUBLIC_RUO_GEO_DENY_STATES=
NEXT_PUBLIC_RUO_GEO_DENY_STATES=NJ
NEXT_PUBLIC_RUO_GEO_DENY_STATES=NJ,MA,LA
```

Where the gate fires:

1. **Storefront client UI** — `ShippingAddress` shows an inline deny
   message under the State / Province field as the user types.
2. **Storefront server action** — `setAddresses` re-validates server-side
   and refuses to update the cart, returning the same deny message.
   Logs a structured `ruo.geo.checkout_rejected` event (state code +
   cart-id prefix, no PII) to the Next.js server log.
3. **Backend audit subscriber** — `ruo-geo-audit` listens on
   `order.placed` and `logger.error`s any order that shipped to a
   deny-listed state (defense-in-depth — should never fire if the
   storefront gate is intact). The error log uses the structured key
   `event=ruo.geo.audit_violation` so it's greppable in the log drain.
4. **Slack alert (SKA-29)** — when `RUO_GEO_ALERT_WEBHOOK_URL` is set,
   the same audit subscriber posts a `:rotating_light:` message to the
   configured channel (typically `#calilean-alerts`) with the order id,
   state, env, and timestamp. The Slack post is fire-and-forget with a
   3-second timeout — webhook outages cannot break the order pipeline.

## Suppress a state — runbook

Time-box: **<15 minutes from go-decision to gate live**.

1. **Decide.** CEO or counsel approval required. Capture the trigger
   (which letter / regulator / state) in the SKA-27 incident issue. Write
   down the 2-letter code(s) you are about to suppress.

2. **Update Railway env vars.** In the Railway dashboard:
   - storefront service → variables → set
     `NEXT_PUBLIC_RUO_GEO_DENY_STATES` to the new comma-separated list.
   - backend service → variables → set `RUO_GEO_DENY_STATES` to the same
     value.
   Save both. Railway will trigger a redeploy of each service.

3. **Wait for deploy.** Storefront deploy is the gating one — both the
   client-bundle inline message and the server action need the new
   value. Backend deploy is for the audit subscriber. Typical Railway
   redeploy is 1–3 minutes per service.

4. **Verify live.**
   - Open the storefront in an incognito window.
   - Add a product to cart, proceed to checkout.
   - Enter a US shipping address with `State / Province = <suppressed
     state code>` (e.g. `NJ`).
   - Confirm: the inline deny message appears under the province field,
     and "Continue to delivery" returns the same deny message instead
     of advancing.
   - Repeat with an allowed state to confirm checkout still works.
   - Check the storefront log stream for the
     `ruo.geo.checkout_rejected` JSON line.
   - **Confirm the alert path (SKA-29).** From the backend service shell,
     emit a fake bypass event to verify the Slack webhook is wired up:
     `pnpm ruo:test-alert -- --order test-$(date +%s) --state NJ`. The
     `#calilean-alerts` channel should receive a `:rotating_light:` post
     within ~5 seconds. If you see the `logger.error` line but no Slack
     post, `RUO_GEO_ALERT_WEBHOOK_URL` is unset or wrong on the backend.

5. **Notify support.** Post in `#calilean-support` (or current support
   channel) so any inbound questions from `<state>` shoppers can be
   answered with the standard line: "We're not currently shipping to
   {state} while we complete a regulatory review. Email
   hello@calilean.bio for status."

6. **Track in the SKA-27 incident issue.** Note the timestamp the gate
   went live, the deploy ids, and the Railway commit SHA.

## Un-suppress a state

1. CEO / counsel sign-off that the regulatory issue is resolved.
2. Remove the state code from BOTH env vars (or set the var blank if it
   was the only one). Save → both services redeploy.
3. Verify a checkout to that state works again. Log the resume time in
   the same incident issue.

## Measuring suppression cost

Each rejected checkout writes a structured log line:

```
{"event":"ruo.geo.checkout_rejected","state":"NJ","cart_id_prefix":"abcd1234","ts":"2026-04-26T18:00:00.000Z"}
```

Aggregate from the storefront log drain (Railway logs → log search) by
counting `ruo.geo.checkout_rejected` events per state per day. Multiply
by AOV for an upper-bound revenue-impact estimate. Bring this number to
the next CEO sync if a suppression has been live > 48h, since the
question becomes "is this still cheaper than the alternative?"

## What this hook does NOT do

- It does NOT block browse / PDP / add-to-cart for suppressed states.
  A user in NJ can still browse and add to cart; they get blocked at
  the shipping-address step.
- It does NOT geofence by IP. The check is on the entered shipping
  province. A buyer can enter a different state's address; that is
  acceptable behavior — our liability is around what we ship, not where
  the buyer's browser sits.
- It does NOT modify the Medusa region config or shipping options. Those
  remain "United States" / 50-state for billing and fulfillment.
- It does NOT touch billing address validation; suppression is on the
  shipping address only (where the package goes).

## If something goes wrong

- **Inline UI message not appearing after redeploy:** the
  `NEXT_PUBLIC_*` variable must exist at storefront BUILD time, not
  just runtime. Re-trigger the storefront deploy on Railway.
- **Server action accepts a suppressed state:** check `setAddresses` in
  `storefront/src/lib/data/cart.ts` still calls `isUsStateAllowed`.
- **Audit subscriber logs an error after a suppressed-state order:** the
  storefront gate was bypassed (a direct `/store/cart` SDK call, an
  admin-created order, or a misconfigured env). Treat as a sev-2:
  refund/cancel the order, then audit.
- **Bypass logged but no Slack alert (SKA-29):** the
  `RUO_GEO_ALERT_WEBHOOK_URL` env var is unset or the webhook URL
  rotated. Re-create a Slack incoming webhook for `#calilean-alerts`
  and set the var on the backend service. Re-run
  `pnpm ruo:test-alert` to confirm. Webhook failures are logged at
  `warn` (`[RUO geo alert] webhook ...`) — they do not block orders.

## Bypass alert setup (one-time, SKA-29)

The webhook is configured once per environment (staging + prod each
get their own). To set it up:

1. In Slack: `Apps → Incoming Webhooks → Add New Webhook to Workspace`.
   Pick `#calilean-alerts` (create it if it doesn't exist). Copy the
   `https://hooks.slack.com/services/...` URL.
2. In Railway, on the `backend` service, add env var
   `RUO_GEO_ALERT_WEBHOOK_URL=<webhook-url>` and redeploy.
3. From the backend service shell (or local checkout with the env var
   set), run `pnpm ruo:test-alert -- --order test-001 --state NJ` and
   confirm a `:rotating_light:` post in `#calilean-alerts` within ~5
   seconds.

Rotation: if the webhook leaks (it ends up in a public log, etc.),
revoke it from the Slack app config, generate a new one, and update
the Railway env var. Railway restarts the service on env-var change,
so the audit subscriber will pick up the new URL after that restart
(typically <60s).
