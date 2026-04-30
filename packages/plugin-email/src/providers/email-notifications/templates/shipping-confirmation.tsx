import { Text, Section, Hr, Link, Button } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { OrderDTO, OrderAddressDTO } from "@medusajs/framework/types"
import { BRAND, COLORS } from "../lib/brand"

export const SHIPPING_CONFIRMATION = "shipping-confirmation"

export interface ShippingConfirmationTemplateProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  tracking_number?: string
  tracking_url?: string
  preview?: string
}

export const isShippingConfirmationData = (
  data: any
): data is ShippingConfirmationTemplateProps =>
  typeof data.order === "object" && typeof data.shippingAddress === "object"

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

export const ShippingConfirmationTemplate: React.FC<ShippingConfirmationTemplateProps> & {
  PreviewProps: ShippingConfirmationTemplateProps
} = ({
  order,
  shippingAddress,
  tracking_number,
  tracking_url,
  preview = "Your Cali Lean order has shipped.",
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
        Your order has shipped
      </Text>

      <Text style={bodyText}>
        Good news, {shippingAddress.first_name}. Your order is on its way.
      </Text>

      {tracking_url && (
        <Section style={{ margin: "24px 0" }}>
          <Button
            href={tracking_url}
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
            Track shipment
          </Button>
        </Section>
      )}

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 20px" }} />

      <Section>
        <Text style={sectionHeading}>Order details</Text>
        <Text style={bodyText}>Order #{order.display_id}</Text>
        <Text style={bodyText}>
          {new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </Section>

      {(tracking_number || tracking_url) && (
        <>
          <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 20px" }} />

          <Section>
            <Text style={sectionHeading}>Tracking</Text>
            {tracking_number && (
              <Text
                style={{
                  ...bodyText,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                }}
              >
                {tracking_url ? (
                  <Link
                    href={tracking_url}
                    style={{ color: COLORS.pacific, textDecoration: "none" }}
                  >
                    {tracking_number}
                  </Link>
                ) : (
                  tracking_number
                )}
              </Text>
            )}
          </Section>
        </>
      )}

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 20px" }} />

      <Section>
        <Text style={sectionHeading}>Shipping to</Text>
        <Text style={bodyText}>
          {shippingAddress.first_name} {shippingAddress.last_name}
        </Text>
        <Text style={bodyText}>{shippingAddress.address_1}</Text>
        <Text style={bodyText}>
          {shippingAddress.city}, {shippingAddress.province}{" "}
          {shippingAddress.postal_code}
        </Text>
      </Section>

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 20px" }} />

      <Text style={{ ...bodyText, fontSize: 14, color: COLORS.fog }}>
        Each item ships with a Certificate of Analysis. Open the inner box flap
        to find the QR code that links to your batch's COA.
      </Text>

      <Text style={{ fontSize: 14, color: COLORS.fog, margin: "16px 0 0" }}>
        {BRAND.signoff}
      </Text>
    </Base>
  )
}

ShippingConfirmationTemplate.PreviewProps = {
  order: {
    id: "test-order-id",
    display_id: "ORD-456",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    currency_code: "USD",
    items: [],
  },
  shippingAddress: {
    first_name: "Test",
    last_name: "Researcher",
    address_1: "123 Vista Del Mar",
    city: "El Segundo",
    province: "CA",
    postal_code: "90245",
    country_code: "US",
  },
  tracking_number: "1Z999AA10123456784",
  tracking_url: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
} as unknown as ShippingConfirmationTemplateProps

export default ShippingConfirmationTemplate
