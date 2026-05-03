/**
 * Manual smoke-test for the RUO geo-bypass Slack alert (SKA-29).
 *
 * Emits a fake bypass payload directly through the alert helper so an
 * operator can verify `RUO_GEO_ALERT_WEBHOOK_URL` is wired up without
 * having to fabricate an order and bypass the storefront gate.
 *
 * Usage (from `backend/`):
 *   pnpm ruo:test-alert -- --order test-001 --state NJ
 *   pnpm ruo:test-alert                       # uses defaults
 *
 * Exits non-zero if the webhook URL is unset, so this can be wired into
 * a deploy verification step later.
 */
import { notifyGeoBypass } from "../lib/ruo-alert"

type Args = {
  orderId: string
  state: string
  countryCode: string
  env?: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    orderId: `test-${Date.now()}`,
    state: "NJ",
    countryCode: "US",
  }
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    const value = argv[i + 1]
    if (!value || value.startsWith("--")) continue
    if (flag === "--order") {
      args.orderId = value
      i++
    } else if (flag === "--state") {
      args.state = value.toUpperCase()
      i++
    } else if (flag === "--country") {
      args.countryCode = value.toUpperCase()
      i++
    } else if (flag === "--env") {
      args.env = value
      i++
    }
  }
  return args
}

const consoleLogger = {
  warn: (msg: string) => console.warn(msg),
  error: (msg: string) => console.error(msg),
}

async function main() {
  const url = (process.env.RUO_GEO_ALERT_WEBHOOK_URL ?? "").trim()
  if (!url) {
    console.error(
      "[ruo:test-alert] RUO_GEO_ALERT_WEBHOOK_URL is unset — nothing to test."
    )
    console.error(
      "  Set it on this shell or the Railway service, then re-run."
    )
    process.exit(1)
  }

  const args = parseArgs(process.argv.slice(2))
  console.log(
    `[ruo:test-alert] firing fake bypass: order=${args.orderId} state=${args.state} country=${args.countryCode} env=${args.env ?? process.env.NODE_ENV ?? "unknown"}`
  )

  await notifyGeoBypass(args, consoleLogger)
  console.log(
    "[ruo:test-alert] done. Check #calilean-alerts (or the configured channel) for a :rotating_light: post."
  )
}

main().catch((err) => {
  console.error("[ruo:test-alert] unexpected failure:", err)
  process.exit(2)
})
