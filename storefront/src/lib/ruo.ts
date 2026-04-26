/**
 * Research-Use-Only (RUO) compliance copy.
 *
 * Single source of truth for every disclaimer, attestation, and legal-adjacent
 * string surfaced in the storefront and transactional emails. CMO owns final
 * copy via SKA-11; values here are placeholders until that lands.
 *
 * Versioning: bump RUO_ATTESTATION_VERSION whenever attestation language
 * changes, so order metadata records which version a customer agreed to.
 */

export const RUO_DISCLAIMER_SHORT =
  "For research use only. Not for human consumption."

export const RUO_DISCLAIMER_LONG =
  "All CaliLean products are sold strictly for in-vitro research and laboratory use. They are not drugs, food, cosmetics, or dietary supplements, and are not intended to diagnose, treat, cure, or prevent any disease. Products are not for human or animal consumption. By purchasing, you confirm you are a qualified researcher and accept full responsibility for safe handling and lawful use."

export const RUO_ATTESTATION_LABEL =
  "I confirm I am a qualified researcher purchasing for in-vitro research only, and I will not consume these products or administer them to humans or animals."

export const RUO_ATTESTATION_VERSION = "1.0"

export const RUO_AGE_GATE_HEADLINE = "Access research compounds"

export const RUO_AGE_GATE_BODY =
  "CaliLean sells research-grade peptides for laboratory use only. You must be 21 or older to enter."

/**
 * SKU-level attestations.
 *
 * Some SKUs need an additional attestation surfaced on the PDP and at checkout
 * (in addition to the general RUO_ATTESTATION_LABEL). Keyed by SKU/product
 * handle. Attestation flags are persisted to order metadata as
 * `${key}_attestation_v${RETA_ATTESTATION_VERSION}: true` for audit.
 *
 * Source: CMO copy (locked) per SKA-12 plan v2 §2.1, §5.2.1.
 */

export const RETA_ATTESTATION_VERSION = "1"

export const RETA_ATTESTATION_HEADLINE =
  "Retatrutide is a research compound, not a weight-loss medication."

export const RETA_ATTESTATION_BULLETS = [
  "Retatrutide is sold to me for research use only.",
  "It is not approved by the FDA for human consumption, weight loss, or treatment of any condition.",
  "I will not consume it, administer it to another person, or represent it as a therapeutic product.",
  "If I am seeking medical treatment for metabolic conditions, I will consult a licensed physician — not this storefront.",
] as const

export const RETA_ATTESTATION_LABEL =
  "I confirm I am acquiring Retatrutide solely for in-vitro research and that I accept the terms above."

/**
 * Product handles that trigger the Retatrutide attestation block. Keep in sync
 * with backend product seed metadata. Lower-cased handles only.
 */
export const RETA_PRODUCT_HANDLES = ["retatrutide"] as const
