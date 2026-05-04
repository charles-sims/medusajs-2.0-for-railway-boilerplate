import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"
import { ErpNextOptions } from "./types"

export function mapOrderToSalesInvoice(
  order: OrderDTO,
  customerName: string,
  opts: Pick<ErpNextOptions, "company" | "income_account" | "debit_account">
): Record<string, unknown> {
  const lineItems = (order.items || []).map((item: any) => ({
    item_code: item.variant_sku || item.product_handle || item.title,
    item_name: item.title,
    description: item.subtitle ? `${item.title} — ${item.subtitle}` : item.title,
    qty: item.quantity,
    rate: Number(item.unit_price || 0),
    amount: Number(item.total || 0),
    income_account: opts.income_account,
  }))

  if (Number((order as any).shipping_total) > 0) {
    lineItems.push({
      item_code: "Shipping",
      item_name: "Shipping",
      description: "Shipping",
      qty: 1,
      rate: Number((order as any).shipping_total),
      amount: Number((order as any).shipping_total),
      income_account: opts.income_account,
    })
  }

  return {
    doctype: "Sales Invoice",
    company: opts.company,
    customer: customerName,
    debit_to: opts.debit_account,
    posting_date: new Date(order.created_at).toISOString().split("T")[0],
    currency: (order.currency_code || "USD").toUpperCase(),
    items: lineItems,
    custom_medusa_order_id: order.id,
    remarks: `Medusa Order #${order.display_id}`,
  }
}

export function mapCustomerToErpNext(customer: CustomerDTO): Record<string, unknown> {
  return {
    doctype: "Customer",
    customer_name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
    customer_type: "Individual",
    email_id: customer.email,
    mobile_no: customer.phone,
    custom_medusa_customer_id: customer.id,
  }
}

export function mapProductToErpNextItem(product: { id: string; title: string; variants: any[] }): Record<string, unknown> {
  return {
    doctype: "Item",
    item_name: product.title,
    item_code: product.variants?.[0]?.sku || product.id,
    item_group: "Products",
    stock_uom: "Nos",
    custom_medusa_product_id: product.id,
  }
}
