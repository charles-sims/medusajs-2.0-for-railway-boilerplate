/**
 * Verifies the per-state checkout suppression hook (SKA-28).
 *
 * The gate is env-driven via `RUO_GEO_DENY_STATES`. We restore the
 * pre-test value in afterEach so cases don't leak.
 */
import {
  getRuoGeoDenyStates,
  isUsStateAllowed,
  normalizeUsStateCode,
} from "../ruo"

const ENV_KEY = "RUO_GEO_DENY_STATES"

describe("RUO per-state suppression", () => {
  const originalEnv = process.env[ENV_KEY]

  afterEach(() => {
    if (originalEnv === undefined) delete process.env[ENV_KEY]
    else process.env[ENV_KEY] = originalEnv
  })

  describe("getRuoGeoDenyStates parser", () => {
    it("returns empty when var is unset", () => {
      delete process.env[ENV_KEY]
      expect(getRuoGeoDenyStates()).toEqual([])
    })

    it("returns empty when var is blank", () => {
      process.env[ENV_KEY] = ""
      expect(getRuoGeoDenyStates()).toEqual([])
      process.env[ENV_KEY] = "   "
      expect(getRuoGeoDenyStates()).toEqual([])
    })

    it("parses a single code", () => {
      process.env[ENV_KEY] = "CA"
      expect(getRuoGeoDenyStates()).toEqual(["CA"])
    })

    it("parses a comma-separated list", () => {
      process.env[ENV_KEY] = "NJ,MA,LA"
      expect(getRuoGeoDenyStates()).toEqual(["NJ", "MA", "LA"])
    })

    it("normalizes case and whitespace", () => {
      process.env[ENV_KEY] = " ca , nj ,  Ma "
      expect(getRuoGeoDenyStates()).toEqual(["CA", "NJ", "MA"])
    })

    it("dedupes entries", () => {
      process.env[ENV_KEY] = "CA,ca,CA"
      expect(getRuoGeoDenyStates()).toEqual(["CA"])
    })

    it("drops malformed tokens", () => {
      process.env[ENV_KEY] = "CA,California,,N,NJ"
      expect(getRuoGeoDenyStates()).toEqual(["CA", "NJ"])
    })
  })

  describe("isUsStateAllowed", () => {
    it("allows everything when deny-list is empty", () => {
      delete process.env[ENV_KEY]
      expect(isUsStateAllowed("CA", "US")).toBe(true)
      expect(isUsStateAllowed("NJ", "US")).toBe(true)
      expect(isUsStateAllowed(null, "US")).toBe(true)
    })

    it("blocks a CA shipping address when CA is suppressed", () => {
      process.env[ENV_KEY] = "CA"
      expect(isUsStateAllowed("CA", "US")).toBe(false)
      expect(isUsStateAllowed("California", "US")).toBe(false)
      expect(isUsStateAllowed(" ca ", "us")).toBe(false)
    })

    it("allows non-suppressed states when CA is suppressed", () => {
      process.env[ENV_KEY] = "CA"
      expect(isUsStateAllowed("NJ", "US")).toBe(true)
      expect(isUsStateAllowed("TX", "US")).toBe(true)
    })

    it("ignores non-US country codes (deny-list is US-only)", () => {
      process.env[ENV_KEY] = "CA"
      expect(isUsStateAllowed("CA", "CA")).toBe(true)
      expect(isUsStateAllowed("ON", "CA")).toBe(true)
    })

    it("restores access when CA is removed from the list", () => {
      process.env[ENV_KEY] = "CA"
      expect(isUsStateAllowed("CA", "US")).toBe(false)
      process.env[ENV_KEY] = ""
      expect(isUsStateAllowed("CA", "US")).toBe(true)
    })

    it("blocks multiple states from a multi-state list", () => {
      process.env[ENV_KEY] = "CA,NJ,MA"
      expect(isUsStateAllowed("CA", "US")).toBe(false)
      expect(isUsStateAllowed("NJ", "US")).toBe(false)
      expect(isUsStateAllowed("MA", "US")).toBe(false)
      expect(isUsStateAllowed("TX", "US")).toBe(true)
    })
  })

  describe("normalizeUsStateCode", () => {
    it("returns 2-letter codes unchanged", () => {
      expect(normalizeUsStateCode("CA")).toBe("CA")
      expect(normalizeUsStateCode("nj")).toBe("NJ")
    })

    it("maps full state names to 2-letter codes", () => {
      expect(normalizeUsStateCode("California")).toBe("CA")
      expect(normalizeUsStateCode("new jersey")).toBe("NJ")
      expect(normalizeUsStateCode("District of Columbia")).toBe("DC")
    })

    it("returns the upper-cased input when unknown", () => {
      expect(normalizeUsStateCode("Atlantis")).toBe("ATLANTIS")
    })
  })
})
