/**
 * Brand constants for transactional email templates.
 *
 * Colors mirror the storefront tokens in
 * `storefront/src/styles/calilean-tokens.css` (v2 — White + Carolina Blue + Black).
 * React Email cannot read CSS variables across mail clients, so the hex
 * values are duplicated here. Keep in sync if the palette changes.
 *
 * `BRAND` mirrors the canonical strings from `docs/brand/storefront-copy.md`
 * §15 (sender identity) and §17 (microcopy). Update both at once if the
 * support / sender addresses move.
 */

export const COLORS = {
  bg: "#FFFFFF",
  ink: "#111111",
  pacific: "#7090AB",
  fog: "#9CA3A8",
  sand: "#F0F0F0",
  coa: "#111111",
  alert: "#A23B2A",
  border: "#F0F0F0",
  divider: "#E5E5E5",
} as const

export const BRAND = {
  name: "CaliLean",
  domain: "calilean.com",
  url: "https://calilean.com",
  fromEmail: "Cali Lean <hello@send.calilean.com>",
  replyTo: "hello@calilean.com",
  supportEmail: "research@calilean.com",
  signoff: "— The CaliLean team",
} as const
