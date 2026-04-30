import { Button, Section, Text, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"
import { BRAND, COLORS } from "../lib/brand"

export const ABANDONED_CART = "abandoned-cart"

export interface AbandonedCartTemplateProps {
  customer_name?: string
  cart_id?: string
  items?: Array<{
    title?: string
    variant_title?: string
    quantity?: number
    unit_price?: number
    thumbnail?: string
  }>
  preview?: string
}

export const isAbandonedCartData = (
  data: any
): data is AbandonedCartTemplateProps => true

export const AbandonedCartTemplate: React.FC<AbandonedCartTemplateProps> & {
  PreviewProps: AbandonedCartTemplateProps
} = ({
  customer_name,
  items = [],
  preview = "You left something behind.",
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
        Still thinking it over?
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: "24px",
          color: COLORS.ink,
          margin: "0 0 8px",
        }}
      >
        {customer_name ? `Hey ${customer_name}, you` : "You"} left
        {items.length === 1 ? " an item" : " some items"} in your cart.
        {items.length > 0 ? " Here's what's waiting:" : ""}
      </Text>

      {items.length > 0 && (
        <>
          <Hr style={{ borderColor: COLORS.divider, margin: "24px 0 16px" }} />
          {items.map((item, i) => (
            <Text
              key={i}
              style={{
                fontSize: 14,
                lineHeight: "22px",
                color: COLORS.ink,
                margin: "0 0 4px",
              }}
            >
              {item.title}
              {item.variant_title ? ` — ${item.variant_title}` : ""} x{" "}
              {item.quantity || 1}
            </Text>
          ))}
        </>
      )}

      <Section style={{ margin: "28px 0" }}>
        <Button
          href={`${BRAND.url}/store`}
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
          Return to store
        </Button>
      </Section>

      <Text style={{ fontSize: 14, color: COLORS.fog, margin: "16px 0 0" }}>
        {BRAND.signoff}
      </Text>
    </Base>
  )
}

AbandonedCartTemplate.PreviewProps = {
  customer_name: "Alex",
  items: [
    { title: "BPC-157 5mg", variant_title: "5mg vial", quantity: 2 },
    { title: "TB-500 5mg", variant_title: "5mg vial", quantity: 1 },
  ],
}

export default AbandonedCartTemplate
