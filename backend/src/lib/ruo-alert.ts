/**
 * RUO geo-bypass alert transport (SKA-29).
 *
 * Posts a Slack incoming-webhook message when an order ships to a
 * deny-listed US state — i.e. the storefront gate was bypassed (direct
 * SDK call, admin-created order, or env drift between storefront and
 * backend deny-lists). The audit subscriber emits a `logger.error`
 * regardless; this is the human-facing notification on top.
 *
 * Driven by `RUO_GEO_ALERT_WEBHOOK_URL`. If unset/blank, this is a
 * no-op so non-prod environments stay quiet.
 *
 * Failure is swallowed: the order has already been placed by the time
 * the audit subscriber runs, so a webhook outage MUST NOT break the
 * order pipeline. We log the failure and move on.
 *
 * Stable event key: `ruo.geo.audit_violation`.
 */

export type RuoGeoAlertInput = {
  orderId: string
  state: string
  countryCode?: string | null
  /** Optional environment label — defaults to NODE_ENV. */
  env?: string
}

const EVENT_KEY = "ruo.geo.audit_violation"
const TIMEOUT_MS = 3000

type Logger = {
  warn: (msg: string) => void
  error: (msg: string) => void
}

export async function notifyGeoBypass(
  input: RuoGeoAlertInput,
  logger: Logger
): Promise<void> {
  const url = (process.env.RUO_GEO_ALERT_WEBHOOK_URL ?? "").trim()
  if (!url) return

  const env = input.env ?? process.env.NODE_ENV ?? "unknown"
  const country = input.countryCode ?? "US"
  const ts = new Date().toISOString()

  const text = [
    ":rotating_light: *RUO geo bypass* — order shipped to deny-listed state",
    `• event: \`${EVENT_KEY}\``,
    `• state: \`${input.state}\` (${country})`,
    `• order: \`${input.orderId}\``,
    `• env: \`${env}\``,
    `• ts: \`${ts}\``,
    "",
    "The storefront state-suppression gate was bypassed. Treat as sev-2: " +
      "verify the deny-list env var is in sync between storefront and backend, " +
      "then refund/cancel the order if appropriate. Runbook: " +
      "`docs/ops/per-state-suppression.md`.",
  ].join("\n")

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
    if (!res.ok) {
      logger.warn(
        `[RUO geo alert] webhook returned ${res.status} for order ${input.orderId} state ${input.state}`
      )
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    logger.warn(
      `[RUO geo alert] webhook post failed for order ${input.orderId} state ${input.state}: ${reason}`
    )
  } finally {
    clearTimeout(timer)
  }
}
