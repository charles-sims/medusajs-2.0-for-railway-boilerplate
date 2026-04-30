import { Button, Link, Section, Text, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { BRAND, COLORS } from "../lib/brand"

export const INVITE_USER = "invite-user"

export interface InviteUserEmailProps {
  inviteLink: string
  preview?: string
}

export const isInviteUserData = (data: any): data is InviteUserEmailProps =>
  typeof data.inviteLink === "string" &&
  (typeof data.preview === "string" || !data.preview)

export const InviteUserEmail: React.FC<InviteUserEmailProps> & {
  PreviewProps: InviteUserEmailProps
} = ({
  inviteLink,
  preview = `You've been invited to ${BRAND.name}.`,
}) => {
  return (
    <Base preview={preview}>
      <Text
        style={{
          fontSize: 18,
          lineHeight: "26px",
          color: COLORS.ink,
          margin: "0 0 16px",
        }}
      >
        You've been invited to be an administrator on{" "}
        <strong>{BRAND.name}</strong>.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <Button
          href={inviteLink}
          style={{
            backgroundColor: COLORS.ink,
            borderRadius: 9,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            padding: "12px 20px",
            textDecoration: "none",
          }}
        >
          Accept invitation
        </Button>
      </Section>

      <Text
        style={{
          fontSize: 14,
          lineHeight: "22px",
          color: COLORS.ink,
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
          href={inviteLink}
          style={{ color: COLORS.pacific, textDecoration: "none" }}
        >
          {inviteLink}
        </Link>
      </Text>

      <Hr style={{ borderColor: COLORS.divider, margin: "16px 0" }} />

      <Text
        style={{
          fontSize: 12,
          lineHeight: "20px",
          color: COLORS.fog,
          margin: 0,
        }}
      >
        If you weren't expecting this invitation you can ignore this email; the
        invitation will expire in 24 hours. If you're concerned about your
        account's safety, reply to this email and we'll get back to you.
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

InviteUserEmail.PreviewProps = {
  inviteLink:
    "https://admin.calilean.com/app/invite?token=abc123ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
}

export default InviteUserEmail
