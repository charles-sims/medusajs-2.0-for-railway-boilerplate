import {
  Html,
  Body,
  Container,
  Preview,
  Head,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components"
import * as React from "react"
import { BRAND, COLORS, RUO_DISCLAIMER_SHORT } from "../lib/brand"

interface BaseProps {
  preview?: string
  children: React.ReactNode
}

/**
 * Shared transactional email shell — CaliLean brand chrome (header wordmark,
 * neutral salt/sand background, pacific link/accent color, RUO short-form
 * disclaimer, support address). Every template wraps its body in <Base>.
 *
 * The wordmark is plain styled text (not an <img>) because the storefront
 * `CaliLeanLogo` is a font-dependent SVG and email clients strip both custom
 * fonts and many SVGs. When a brand-bucket-hosted PNG ships, swap this for
 * an <Img>.
 */
export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview ?? ""}</Preview>
      <Body
        style={{
          backgroundColor: COLORS.bg,
          color: COLORS.ink,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "32px 8px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            margin: "0 auto",
            padding: 24,
            maxWidth: 520,
            width: "100%",
          }}
        >
          <Section style={{ paddingBottom: 16 }}>
            <Text
              style={{
                margin: 0,
                fontFamily:
                  "Georgia, 'Times New Roman', Times, serif",
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: COLORS.ink,
              }}
            >
              calilean
            </Text>
          </Section>

          <Hr
            style={{
              borderColor: COLORS.divider,
              margin: "0 0 24px",
            }}
          />

          <Section>{children}</Section>

          <Hr
            style={{
              borderColor: COLORS.divider,
              margin: "32px 0 16px",
            }}
          />

          <Section>
            <Text
              style={{
                fontSize: 11,
                lineHeight: "16px",
                color: COLORS.fog,
                margin: "0 0 8px",
                textAlign: "center",
              }}
            >
              {RUO_DISCLAIMER_SHORT}
            </Text>
            <Text
              style={{
                fontSize: 11,
                lineHeight: "16px",
                color: COLORS.fog,
                margin: 0,
                textAlign: "center",
              }}
            >
              {BRAND.name} · El Segundo, CA ·{" "}
              <Link
                href={`mailto:${BRAND.supportEmail}`}
                style={{ color: COLORS.pacific, textDecoration: "none" }}
              >
                {BRAND.supportEmail}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
