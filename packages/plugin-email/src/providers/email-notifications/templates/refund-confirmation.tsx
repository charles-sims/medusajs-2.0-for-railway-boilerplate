import { Text, Section, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { OrderDTO } from "@medusajs/framework/types"
import { BRAND, COLORS } from "../lib/brand"

export const REFUND_CONFIRMATION = "refund-confirmation"

export interface RefundConfirmationTemplateProps {
  order: OrderDTO & { display_id: string }
  refund_amount: number
  currency_code: string
  reason?: string
  preview?: string
}

export const isRefundConfirmationData = (
  data: any
): data is RefundConfirmationTemplateProps =>
  typeof data.order === "object" &&
  typeof data.refund_amount === "number" &&
  typeof data.currency_code === "string"

const sectionHeading: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: COLORS.fog,
  margin: "0 0 10px",
}

const bodyText: React.CSSProperties = {
  fontSize: 15,
  lineHeight: "24px",
  color: COLORS.ink,
  margin: "0 0 6px",
}

export const RefundConfirmationTemplate: React.FC<RefundConfirmationTemplateProps> & {
  PreviewProps: RefundConfirmationTemplateProps
} = ({
  order,
  refund_amount,
  currency_code,
  reason,
  preview = "Your Cali Lean refund has been processed.",
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
        Refund processed
      </Text>

      <Text style={bodyText}>
        We've processed a refund for your order. The amount should appear on your
        original payment method within 5-10 business days.
      </Text>

      <Hr style={{ borderColor: COLORS.divider, margin: "28px 0 20px" }} />

      <Section>
        <Text style={sectionHeading}>Refund details</Text>
        <Text style={bodyText}>Order #{order.display_id}</Text>
        <Text
          style={{
            ...bodyText,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
          }}
        >
          {refund_amount} {currency_code.toUpperCase()}
        </Text>
        {reason && (
          <Text style={{ ...bodyText, fontSize: 14, color: COLORS.fog }}>
            Reason: {reason}
          </Text>
        )}
      </Section>

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 20px" }} />

      <Text style={{ ...bodyText, fontSize: 14, color: COLORS.fog }}>
        If you have questions about this refund, reply to this email or
        contact us at {BRAND.supportEmail}.
      </Text>

      <Text style={{ fontSize: 14, color: COLORS.fog, margin: "16px 0 0" }}>
        {BRAND.signoff}
      </Text>
    </Base>
  )
}

RefundConfirmationTemplate.PreviewProps = {
  order: {
    id: "test-order-id",
    display_id: "ORD-789",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    currency_code: "USD",
    items: [],
  },
  refund_amount: 60,
  currency_code: "USD",
  reason: "Item did not meet research specifications",
} as unknown as RefundConfirmationTemplateProps

export default RefundConfirmationTemplate
