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
