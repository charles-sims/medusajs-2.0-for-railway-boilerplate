import {
  Html,
  Body,
  Container,
  Preview,
  Head,
  Section,
  Text,
  Hr,
  Img,
  Link,
  Font,
} from "@react-email/components"
import * as React from "react"
import { BRAND, COLORS, FONT_STACK, RUO_DISCLAIMER_SHORT } from "../lib/brand"

interface BaseProps {
  preview?: string
  children: React.ReactNode
}

/**
 * Shared transactional email shell — Cali Lean brand chrome.
 *
 * Header: logo PNG hosted on the media bucket, centered.
 * Body font: Plus Jakarta Sans with system sans-serif fallbacks.
 * Footer: RUO short-form disclaimer, support address.
 */
export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NShXUEKi4Rw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_m07NShXUEKi4Rw.woff2",
            format: "woff2",
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview ?? ""}</Preview>
      <Body
        style={{
          backgroundColor: COLORS.sand,
          color: COLORS.ink,
          fontFamily: FONT_STACK,
          margin: 0,
          padding: "40px 16px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            margin: "0 auto",
            padding: "32px 28px",
            maxWidth: 520,
            width: "100%",
          }}
        >
          {/* Logo */}
          <Section style={{ textAlign: "center", paddingBottom: 24 }}>
            <Link href={BRAND.url} style={{ textDecoration: "none" }}>
              <Img
                src={BRAND.logoUrl}
                alt={BRAND.name}
                width={BRAND.logoWidth}
                height={BRAND.logoHeight}
                style={{
                  display: "inline-block",
                  margin: "0 auto",
                }}
              />
            </Link>
          </Section>

          <Hr
            style={{
              borderColor: COLORS.divider,
              margin: "0 0 28px",
            }}
          />

          {/* Template body */}
          <Section>{children}</Section>

          <Hr
            style={{
              borderColor: COLORS.divider,
              margin: "36px 0 20px",
            }}
          />

          {/* Footer */}
          <Section>
            <Text
              style={{
                fontSize: 11,
                lineHeight: "16px",
                color: COLORS.fog,
                margin: "0 0 8px",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              {RUO_DISCLAIMER_SHORT}
            </Text>
            <Text
              style={{
                fontSize: 11,
                lineHeight: "16px",
                color: COLORS.fog,
                margin: "0 0 4px",
                textAlign: "center",
              }}
            >
              {BRAND.name} · El Segundo, CA
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
              <Link
                href={`mailto:${BRAND.supportEmail}`}
                style={{ color: COLORS.pacific, textDecoration: "none" }}
              >
                {BRAND.supportEmail}
              </Link>
              {" · "}
              <Link
                href={BRAND.url}
                style={{ color: COLORS.pacific, textDecoration: "none" }}
              >
                {BRAND.domain}
              </Link>
            </Text>
          </Section>
        </Container>

        {/* Unsubscribe / legal footer outside card */}
        <Text
          style={{
            fontSize: 10,
            lineHeight: "14px",
            color: COLORS.fog,
            textAlign: "center",
            margin: "16px auto 0",
            maxWidth: 520,
          }}
        >
          {BRAND.tagline}
        </Text>
      </Body>
    </Html>
  )
}
