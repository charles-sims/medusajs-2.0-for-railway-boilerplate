import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export function mapOrderToSalesInvoice(order: OrderDTO): Record<string, unknown> {
  return {
    doctype: "Sales Invoice",
    customer: order.email || "Walk-in Customer",
    posting_date: new Date(order.created_at).toISOString().split("T")[0],
    currency: (order.currency_code || "USD").toUpperCase(),
    items: (order.items || []).map((item) => ({
      item_name: item.title,
      qty: item.quantity,
      rate: Number(item.unit_price || 0) / 100,
      amount: Number(item.total || 0) / 100,
    })),
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
