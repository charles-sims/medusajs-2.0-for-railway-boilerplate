"""
CaliLean brand constants — single source of truth.

Mirrors storefront tokens in apps/storefront/src/styles/calilean-tokens.css
and email brand config in packages/plugin-email/src/providers/email-notifications/lib/brand.ts

Change here → rebuild all documents → everything stays in sync.
"""

# ── Colors ────────────────────────────────────────────────────────────
BG       = "#FFFFFF"
INK      = "#111111"
PACIFIC  = "#7090AB"
FOG      = "#9CA3A8"
SAND     = "#F0F0F0"
COA      = "#111111"
ALERT    = "#A23B2A"

# ── Typography ────────────────────────────────────────────────────────
DISPLAY_FONT = "Instrument Serif"
BODY_FONT    = "Plus Jakarta Sans"
MONO_FONT    = "JetBrains Mono"

DISPLAY_STACK = f"'{DISPLAY_FONT}', Georgia, serif"
BODY_STACK    = f"'{BODY_FONT}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
MONO_STACK    = f"'{MONO_FONT}', 'SF Mono', 'Fira Code', Consolas, monospace"

GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"

# ── Sizes (px for HTML) ──────────────────────────────────────────────
TITLE_SIZE   = 36
H1_SIZE      = 28
H2_SIZE      = 20
H3_SIZE      = 16
BODY_SIZE    = 15
SMALL_SIZE   = 13
CAPTION_SIZE = 11

# ── Brand identity ───────────────────────────────────────────────────
BRAND_NAME       = "Cali Lean"
BRAND_LEGAL      = "CaliLean"
DOMAIN           = "calilean.com"
URL              = "https://calilean.com"
SUPPORT_EMAIL    = "research@calilean.com"
TAGLINE          = "Peptides, plainly labeled."
TAGLINE_ALT      = "Sequenced for results"
SECONDARY_TAG    = "Research-grade. South Bay-built."
SIGNOFF          = "— The Cali Lean team"
RUO_DISCLAIMER   = "For research use only. Not for human consumption."
LOCATION         = "El Segundo, CA"

# ── Assets ───────────────────────────────────────────────────────────
LOGO_BLACK_URL  = "https://bucket-production-4a36.up.railway.app/medusa-media/brand/calilean-logo-email.png"
LOGO_LOCAL_PATH = "docs/brand/logo/master/calilean-logo-black.png"
