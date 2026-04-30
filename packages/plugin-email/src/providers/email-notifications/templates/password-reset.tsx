import { Button, Link, Section, Text, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { BRAND, COLORS } from "../lib/brand"

export const PASSWORD_RESET = "password-reset"

export interface PasswordResetTemplateProps {
  reset_url: string
  email?: string
  preview?: string
}

export const isPasswordResetData = (
  data: any
): data is PasswordResetTemplateProps =>
  typeof data.reset_url === "string"

export const PasswordResetTemplate: React.FC<PasswordResetTemplateProps> & {
  PreviewProps: PasswordResetTemplateProps
} = ({
  reset_url,
  email,
  preview = "Reset your Cali Lean password.",
}) => {
  return (
    <Base preview={preview}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: COLORS.ink,
          margin: "0 0 16px",
          letterSpacing: "-0.01em",
        }}
      >
        Reset your password
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: "24px",
          color: COLORS.ink,
          margin: "0 0 8px",
        }}
      >
        We received a request to reset the password
        {email ? ` for ${email}` : ""}.
        Click below to choose a new password.
      </Text>

      <Section style={{ margin: "28px 0" }}>
        <Button
          href={reset_url}
          style={{
            backgroundColor: COLORS.ink,
            borderRadius: 9,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            padding: "14px 24px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Reset password
        </Button>
      </Section>

      <Text
        style={{
          fontSize: 13,
          lineHeight: "20px",
          color: COLORS.fog,
          margin: "0 0 6px",
        }}
      >
        Or copy and paste this URL into your browser:
      </Text>
      <Text
        style={{
          maxWidth: "100%",
          wordBreak: "break-all",
          overflowWrap: "break-word",
          margin: "0 0 24px",
        }}
      >
        <Link
          href={reset_url}
          style={{ color: COLORS.pacific, textDecoration: "none", fontSize: 13 }}
        >
          {reset_url}
        </Link>
      </Text>

      <Hr style={{ borderColor: COLORS.divider, margin: "16px 0" }} />

      <Text
        style={{
          fontSize: 12,
          lineHeight: "20px",
          color: COLORS.fog,
          margin: "0 0 8px",
        }}
      >
        This link expires in 1 hour. If you didn't request a password reset you
        can safely ignore this email.
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: "22px",
          color: COLORS.fog,
          margin: "16px 0 0",
        }}
      >
        {BRAND.signoff}
      </Text>
    </Base>
  )
}

PasswordResetTemplate.PreviewProps = {
  reset_url:
    "https://calilean.com/reset-password?token=abc123def456&email=researcher@example.com",
  email: "researcher@example.com",
}

export default PasswordResetTemplate
