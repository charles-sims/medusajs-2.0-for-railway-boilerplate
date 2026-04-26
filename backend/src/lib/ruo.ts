/**
 * Research-Use-Only (RUO) compliance copy — backend mirror.
 *
 * Mirrors `storefront/src/lib/ruo.ts`. Backend and storefront are separate
 * apps with no shared workspace, so the canonical strings are duplicated
 * here for use in transactional emails and the cart-completed subscriber
 * that validates attestation metadata.
 *
 * If you change copy here, update `storefront/src/lib/ruo.ts` to match —
 * and bump RUO_ATTESTATION_VERSION when attestation language changes so
 * audit trails stay correct.
 */

export const RUO_DISCLAIMER_SHORT =
  "For research use only. Not for human consumption."

export const RUO_DISCLAIMER_LONG =
  "All CaliLean products are sold strictly for in-vitro research and laboratory use. They are not drugs, food, cosmetics, or dietary supplements, and are not intended to diagnose, treat, cure, or prevent any disease. Products are not for human or animal consumption. By purchasing, you confirm you are a qualified researcher and accept full responsibility for safe handling and lawful use."

export const RUO_ATTESTATION_VERSION = "1.0"

/**
 * Per-state geo deny-list for US shipping. Mirror of `storefront/src/lib/ruo.ts`.
 * Day-0 posture: empty (ship-to-all-50). Entries MUST be 2-letter uppercase
 * US state codes. The order-placed geo-audit subscriber logs an error if an
 * order shipped to a deny-listed state — defense-in-depth audit only, since
 * the storefront gate blocks checkout earlier.
 */
export const RUO_GEO_DENY_STATES: readonly string[] = []

const US_STATE_NAME_TO_CODE: Record<string, string> = {
  ALABAMA: "AL", ALASKA: "AK", ARIZONA: "AZ", ARKANSAS: "AR",
  CALIFORNIA: "CA", COLORADO: "CO", CONNECTICUT: "CT", DELAWARE: "DE",
  "DISTRICT OF COLUMBIA": "DC", FLORIDA: "FL", GEORGIA: "GA",
  HAWAII: "HI", IDAHO: "ID", ILLINOIS: "IL", INDIANA: "IN", IOWA: "IA",
  KANSAS: "KS", KENTUCKY: "KY", LOUISIANA: "LA", MAINE: "ME",
  MARYLAND: "MD", MASSACHUSETTS: "MA", MICHIGAN: "MI", MINNESOTA: "MN",
  MISSISSIPPI: "MS", MISSOURI: "MO", MONTANA: "MT", NEBRASKA: "NE",
  NEVADA: "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ",
  "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC",
  "NORTH DAKOTA": "ND", OHIO: "OH", OKLAHOMA: "OK", OREGON: "OR",
  PENNSYLVANIA: "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
  "SOUTH DAKOTA": "SD", TENNESSEE: "TN", TEXAS: "TX", UTAH: "UT",
  VERMONT: "VT", VIRGINIA: "VA", WASHINGTON: "WA",
  "WEST VIRGINIA": "WV", WISCONSIN: "WI", WYOMING: "WY",
}

export function normalizeUsStateCode(province: string): string {
  const upper = province.trim().toUpperCase()
  if (upper.length === 2) return upper
  return US_STATE_NAME_TO_CODE[upper] ?? upper
}

export function isUsStateAllowed(
  province: string | null | undefined,
  countryCode: string | null | undefined
): boolean {
  if (RUO_GEO_DENY_STATES.length === 0) return true
  if (!countryCode || countryCode.toLowerCase() !== "us") return true
  if (!province) return true
  return !RUO_GEO_DENY_STATES.includes(normalizeUsStateCode(province))
}
