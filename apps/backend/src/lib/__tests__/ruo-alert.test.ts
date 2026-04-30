/**
 * Verifies the RUO geo-bypass alert helper (SKA-29).
 *
 * The helper must:
 *  - no-op silently when RUO_GEO_ALERT_WEBHOOK_URL is unset/blank
 *  - POST a Slack-shaped JSON payload to the configured URL otherwise
 *  - never throw, even when the webhook returns 5xx or fetch rejects
 *  - include the order id, state, country, env, and event key in the
 *    message body so the alert is actionable in Slack
 */
import { notifyGeoBypass } from "../ruo-alert"

const ENV_KEY = "RUO_GEO_ALERT_WEBHOOK_URL"

function makeLogger() {
  return {
    warn: jest.fn(),
    error: jest.fn(),
  }
}

describe("notifyGeoBypass", () => {
  const originalUrl = process.env[ENV_KEY]
  const originalNodeEnv = process.env.NODE_ENV
  const originalFetch = global.fetch

  afterEach(() => {
    if (originalUrl === undefined) delete process.env[ENV_KEY]
    else process.env[ENV_KEY] = originalUrl
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = originalNodeEnv
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it("no-ops when the webhook URL is unset", async () => {
    delete process.env[ENV_KEY]
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const logger = makeLogger()

    await notifyGeoBypass(
      { orderId: "order_01", state: "NJ" },
      logger
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it("no-ops when the webhook URL is blank/whitespace", async () => {
    process.env[ENV_KEY] = "   "
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const logger = makeLogger()

    await notifyGeoBypass(
      { orderId: "order_02", state: "NJ" },
      logger
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("POSTs a Slack-shaped payload with bypass details when URL is set", async () => {
    process.env[ENV_KEY] = "https://hooks.slack.com/services/T0/B0/test"
    process.env.NODE_ENV = "production"
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 })
    global.fetch = fetchMock as unknown as typeof fetch
    const logger = makeLogger()

    await notifyGeoBypass(
      { orderId: "order_03", state: "NJ", countryCode: "US" },
      logger
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://hooks.slack.com/services/T0/B0/test")
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" })

    const body = JSON.parse(init.body)
    expect(typeof body.text).toBe("string")
    expect(body.text).toContain("ruo.geo.audit_violation")
    expect(body.text).toContain("order_03")
    expect(body.text).toContain("NJ")
    expect(body.text).toContain("production")
    expect(body.text).toContain("US")
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it("logs a warn (does not throw) when the webhook returns non-2xx", async () => {
    process.env[ENV_KEY] = "https://hooks.slack.com/services/T0/B0/test"
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 500 })
    global.fetch = fetchMock as unknown as typeof fetch
    const logger = makeLogger()

    await expect(
      notifyGeoBypass({ orderId: "order_04", state: "NJ" }, logger)
    ).resolves.toBeUndefined()

    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0]).toContain("500")
    expect(logger.warn.mock.calls[0][0]).toContain("order_04")
  })

  it("logs a warn (does not throw) when fetch rejects", async () => {
    process.env[ENV_KEY] = "https://hooks.slack.com/services/T0/B0/test"
    const fetchMock = jest.fn().mockRejectedValue(new Error("ENETUNREACH"))
    global.fetch = fetchMock as unknown as typeof fetch
    const logger = makeLogger()

    await expect(
      notifyGeoBypass({ orderId: "order_05", state: "NJ" }, logger)
    ).resolves.toBeUndefined()

    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn.mock.calls[0][0]).toContain("ENETUNREACH")
    expect(logger.warn.mock.calls[0][0]).toContain("order_05")
  })

  it("uses the env override on the input over NODE_ENV", async () => {
    process.env[ENV_KEY] = "https://hooks.slack.com/services/T0/B0/test"
    process.env.NODE_ENV = "production"
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 })
    global.fetch = fetchMock as unknown as typeof fetch
    const logger = makeLogger()

    await notifyGeoBypass(
      { orderId: "order_06", state: "NJ", env: "staging" },
      logger
    )

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.text).toContain("staging")
    expect(body.text).not.toMatch(/env: `production`/)
  })
})
