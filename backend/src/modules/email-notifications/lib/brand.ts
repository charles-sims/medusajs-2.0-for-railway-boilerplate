/**
 * Brand constants for transactional email templates.
 *
 * Colors mirror the storefront tokens in
 * `storefront/src/styles/calilean-tokens.css` (Palette A — Salt & Iron).
 * React Email cannot read CSS variables across mail clients, so the hex
 * values are duplicated here. Keep in sync if the palette changes.
 *
 * `BRAND` mirrors the canonical strings from `docs/brand/storefront-copy.md`
 * §15 (sender identity) and §17 (microcopy). Update both at once if the
 * support / sender addresses move.
 */

export const COLORS = {
  bg: "#F4F2EC",
  ink: "#1F2326",
  pacific: "#3A5A6A",
  fog: "#9CA3A8",
  sand: "#E6E2D6",
  coa: "#0F1417",
  alert: "#A23B2A",
  border: "#E6E2D6",
  divider: "#D8D3C5",
} as const

export const BRAND = {
  name: "CaliLean",
  domain: "calilean.bio",
  url: "https://calilean.bio",
  fromEmail: "notifications@calilean.bio",
  supportEmail: "research@calilean.bio",
  signoff: "— The CaliLean team",
} as const
