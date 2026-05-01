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
  name: "Cali Lean",
  domain: "calilean.com",
  url: "https://calilean.com",
  fromEmail: "Cali Lean <hello@send.calilean.com>",
  replyTo: "hello@calilean.com",
  supportEmail: "hello@calilean.com",
  signoff: "— The Cali Lean team",
  logoUrl:
    "https://bucket-production-4a36.up.railway.app/medusa-media/brand/calilean-logo-email.png",
  logoWidth: 160,
  logoHeight: 30,
  tagline: "Peptides, plainly labeled.",
} as const

/**
 * Email-safe font stack. Plus Jakarta Sans is the brand display font but
 * email clients don't support @font-face reliably, so we lead with system
 * geometric sans-serifs that share the same visual weight.
 */
export const FONT_STACK =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

/**
 * RUO short-form disclaimer — mirrored from `apps/backend/src/lib/ruo.ts`
 * so the plugin stays self-contained. Keep in sync.
 */
export const RUO_DISCLAIMER_SHORT =
  "For research use only. Not for human consumption."
