import { Text, Section, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { OrderDTO, OrderAddressDTO } from "@medusajs/framework/types"
import { COLORS } from "../lib/brand"

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
  preview = "Your COA links and lot numbers.",
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
        Order received.
      </Text>

      <Text style={bodyText}>
        Thanks for the order, {shippingAddress.first_name}.
      </Text>
      <Text style={bodyText}>
        Each item ships with a Certificate of Analysis. Open the inner box flap
        to find the QR code, or click the COA link below per item.
      </Text>

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

      <Section>
        <Text style={sectionHeading}>Order summary</Text>
        <Text style={bodyText}>Order ID: {order.display_id}</Text>
        <Text style={bodyText}>
          Order date: {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Text style={bodyText}>
          Total: {order.summary.raw_current_order_total.value}{" "}
          {order.currency_code}
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

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

      <Section>
        <Text style={sectionHeading}>Items</Text>
        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: COLORS.sand,
              padding: "10px 12px",
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <Text style={{ ...cellText, fontWeight: 700 }}>Item</Text>
            <Text style={{ ...cellText, fontWeight: 700 }}>Qty</Text>
            <Text style={{ ...cellText, fontWeight: 700 }}>Price</Text>
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <Text style={cellText}>
                {item.title} — {item.product_title}
              </Text>
              <Text style={cellText}>{item.quantity}</Text>
              <Text style={cellText}>
                {item.unit_price} {order.currency_code}
              </Text>
            </div>
          ))}
        </div>
      </Section>

      <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />

      <Text style={bodyText}>
        Your order ships from El Segundo. Standard delivery is 2 business days
        to most US addresses.
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
