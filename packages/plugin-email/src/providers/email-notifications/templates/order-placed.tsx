import { Text, Section, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { OrderDTO, OrderAddressDTO } from "@medusajs/framework/types"
import { BRAND, COLORS } from "../lib/brand"

export const ORDER_PLACED = "order-placed"

interface OrderPlacedPreviewProps {
  order: OrderDTO & {
    display_id: string
    summary: { raw_current_order_total: { value: number } }
  }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & {
    display_id: string
    summary: { raw_current_order_total: { value: number } }
  }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (
  data: any
): data is OrderPlacedTemplateProps =>
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

const cellText: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "20px",
  color: COLORS.ink,
  margin: 0,
}

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({
  order,
  shippingAddress,
  preview = "Your Cali Lean order is in.",
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
        Order received.
      </Text>

      <Text style={bodyText}>
        Thanks for the order, {shippingAddress.first_name}.
      </Text>
      <Text style={{ ...bodyText, color: COLORS.fog, fontSize: 14 }}>
        Each item ships with a Certificate of Analysis. Open the inner box flap
        to find the QR code that links to your batch's COA.
      </Text>

      <Hr style={{ borderColor: COLORS.divider, margin: "28px 0 20px" }} />

      <Section>
        <Text style={sectionHeading}>Order summary</Text>
        <Text style={bodyText}>Order #{order.display_id}</Text>
        <Text style={bodyText}>
          {new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={{ ...bodyText, fontWeight: 600 }}>
          Total: {order.summary.raw_current_order_total.value}{" "}
          {order.currency_code?.toUpperCase()}
        </Text>
      </Section>

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

      <Section>
        <Text style={sectionHeading}>Items</Text>
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{
            borderCollapse: "collapse",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: COLORS.sand }}>
              <th
                align="left"
                style={{
                  ...cellText,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: COLORS.fog,
                  padding: "10px 14px",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                Item
              </th>
              <th
                align="right"
                style={{
                  ...cellText,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: COLORS.fog,
                  padding: "10px 14px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  width: 50,
                }}
              >
                Qty
              </th>
              <th
                align="right"
                style={{
                  ...cellText,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: COLORS.fog,
                  padding: "10px 14px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  width: 90,
                }}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id}>
                <td
                  align="left"
                  style={{
                    ...cellText,
                    padding: "10px 14px",
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {item.title} — {item.product_title}
                </td>
                <td
                  align="right"
                  style={{
                    ...cellText,
                    padding: "10px 14px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  align="right"
                  style={{
                    ...cellText,
                    padding: "10px 14px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  {item.unit_price} {order.currency_code?.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Hr style={{ borderColor: COLORS.divider, margin: "28px 0 20px" }} />

      <Text style={{ ...bodyText, fontSize: 14, color: COLORS.fog }}>
        Your order ships from El Segundo. Standard delivery is 2 business days
        to most US addresses.
      </Text>

      <Text style={{ fontSize: 14, color: COLORS.fog, margin: "16px 0 0" }}>
        {BRAND.signoff}
      </Text>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: "test-order-id",
    display_id: "ORD-123",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    currency_code: "USD",
    items: [
      {
        id: "item-1",
        title: "BPC-157 5mg",
        product_title: "BPC-157",
        quantity: 2,
        unit_price: 60,
      },
      {
        id: "item-2",
        title: "TB-500 5mg",
        product_title: "TB-500",
        quantity: 1,
        unit_price: 95,
      },
    ],
    shipping_address: {
      first_name: "Test",
      last_name: "Researcher",
      address_1: "123 Vista Del Mar",
      city: "El Segundo",
      province: "CA",
      postal_code: "90245",
      country_code: "US",
    },
    summary: { raw_current_order_total: { value: 215 } },
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
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
