import { Text, Section, Hr, Link } from "@react-email/components"
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
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: COLORS.fog,
  margin: "0 0 8px",
}

const bodyText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "22px",
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
  preview = "Your CaliLean order has shipped.",
}) => {
  return (
    <Base preview={preview}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: COLORS.ink,
          margin: "0 0 12px",
        }}
      >
        Your order has shipped
      </Text>

      <Text style={bodyText}>
        Good news, {shippingAddress.first_name} — your order is on its way.
      </Text>

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

      <Section>
        <Text style={sectionHeading}>Order details</Text>
        <Text style={bodyText}>Order ID: {order.display_id}</Text>
        <Text style={bodyText}>
          Order date:{" "}
          {new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </Section>

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

      <Section>
        <Text style={sectionHeading}>Shipping address</Text>
        <Text style={bodyText}>{shippingAddress.address_1}</Text>
        <Text style={bodyText}>
          {shippingAddress.city}, {shippingAddress.province}{" "}
          {shippingAddress.postal_code}
        </Text>
        <Text style={bodyText}>{shippingAddress.country_code}</Text>
      </Section>

      {(tracking_number || tracking_url) && (
        <>
          <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

          <Section>
            <Text style={sectionHeading}>Tracking</Text>
            {tracking_number && (
              <Text style={bodyText}>
                Tracking number: {tracking_url ? (
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
            {tracking_url && !tracking_number && (
              <Text style={bodyText}>
                <Link
                  href={tracking_url}
                  style={{ color: COLORS.pacific, textDecoration: "none" }}
                >
                  Track your shipment
                </Link>
              </Text>
            )}
          </Section>
        </>
      )}

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

      <Text style={bodyText}>
        Each item ships with a Certificate of Analysis. Open the inner box flap
        to find the QR code that links to your batch's COA.
      </Text>

      <Text style={{ ...bodyText, marginTop: 16, color: COLORS.fog }}>
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
