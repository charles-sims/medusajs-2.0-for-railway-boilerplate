import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"
import { QboSalesReceipt, QboInvoice, QboCustomer, QboItem, QboLine, QboRefundReceipt } from "./types"

export function mapOrderToSalesReceipt(order: OrderDTO): QboSalesReceipt {
  const lines: QboLine[] = (order.items || []).map((item) => ({
    Amount: Number(item.total || 0) / 100,
    DetailType: "SalesItemLineDetail" as const,
    SalesItemLineDetail: {
      ItemRef: { value: "1", name: item.title },
      Qty: item.quantity,
      UnitPrice: Number(item.unit_price || 0) / 100,
    },
    Description: item.title,
  }))

  return {
    CustomerRef: { value: "1" },
    TxnDate: new Date(order.created_at).toISOString().split("T")[0],
    Line: lines,
    CurrencyRef: { value: (order.currency_code || "USD").toUpperCase() },
    PrivateNote: `Medusa Order #${order.display_id} (${order.id})`,
  }
}

export function mapOrderToInvoice(order: OrderDTO): QboInvoice {
  const lines: QboLine[] = (order.items || []).map((item) => ({
    Amount: Number(item.total || 0) / 100,
    DetailType: "SalesItemLineDetail" as const,
    SalesItemLineDetail: {
      ItemRef: { value: "1", name: item.title },
      Qty: item.quantity,
      UnitPrice: Number(item.unit_price || 0) / 100,
    },
    Description: item.title,
  }))

  // Due date 7 days out (ACH typically clears in 3-5 days)
  const dueDate = new Date(order.created_at)
  dueDate.setDate(dueDate.getDate() + 7)

  return {
    CustomerRef: { value: "1" },
    TxnDate: new Date(order.created_at).toISOString().split("T")[0],
    DueDate: dueDate.toISOString().split("T")[0],
    Line: lines,
    CurrencyRef: { value: (order.currency_code || "USD").toUpperCase() },
    PrivateNote: `Medusa Order #${order.display_id} (${order.id}) — ACH pending settlement`,
  }
}

export function mapCustomerToQbo(customer: CustomerDTO): QboCustomer {
  return {
    DisplayName: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
    PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
    PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
    Active: true,
  }
}

export function mapProductToQboItem(product: { id: string; title: string; variants: any[] }): QboItem {
  return {
    Name: product.title.substring(0, 100),
    Sku: product.variants?.[0]?.sku || undefined,
    Type: "NonInventory",
    IncomeAccountRef: { value: "1" },
    Active: true,
  }
}

export function mapDisputeToRefundReceipt(dispute: {
  amount: number
  currency_code: string
  order_external_id: string
  customer_external_id?: string
  reason: string
}): QboRefundReceipt {
  return {
    CustomerRef: { value: dispute.customer_external_id || "1" },
    Line: [
      {
        Amount: dispute.amount / 100,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: "Chargeback" },
          Qty: 1,
          UnitPrice: dispute.amount / 100,
        },
        Description: `Dispute: ${dispute.reason}`,
      },
    ],
    CurrencyRef: { value: dispute.currency_code.toUpperCase() },
    PrivateNote: `Chargeback for Sales Receipt ${dispute.order_external_id}`,
  }
}
