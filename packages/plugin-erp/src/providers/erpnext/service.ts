import { IErpProvider, ConnectionStatus, ErpInventoryLevel } from "../../modules/erp/types"
import { ErpNextClient } from "./client"
import { ErpNextOptions } from "./types"
import { mapOrderToSalesInvoice, mapCustomerToErpNext, mapProductToErpNextItem } from "./mappers"
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export class ErpNextProviderService implements IErpProvider {
  static identifier = "erpnext"
  identifier = "erpnext"

  private client: ErpNextClient
  private options: ErpNextOptions

  constructor(container: Record<string, unknown>, options: ErpNextOptions) {
    this.client = new ErpNextClient(options)
    this.options = options
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.getList("Company", {}, ["name"])
      return true
    } catch {
      return false
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const connected = await this.isConnected()
    return {
      connected,
      provider_id: "erpnext",
      last_sync_at: null,
      token_expires_at: null,
      realm_id: null,
    }
  }

  private async ensureItem(itemCode: string, itemName: string): Promise<string> {
    // Try direct lookup by item_code
    const existing = await this.client.getListByName("Item", itemCode)
    if (existing) return existing

    // Create non-stock sales item
    const result = await this.client.createDocument("Item", {
      doctype: "Item",
      item_code: itemCode,
      item_name: itemName,
      item_group: "Products",
      stock_uom: "Nos",
      is_stock_item: 0,
      is_sales_item: 1,
      is_purchase_item: 0,
    })
    return result.data.name
  }

  private async findExistingInvoice(orderId: string): Promise<string | null> {
    try {
      const filters = JSON.stringify([["Sales Invoice", "custom_medusa_order_id", "=", orderId]])
      const result = await this.client.getList("Sales Invoice", { _raw_filters: filters }, ["name"])
      return result.data?.[0]?.name ?? null
    } catch {
      return null
    }
  }

  private async ensureCustomer(email: string | undefined): Promise<string> {
    const fallback = "Walk-in Customer"
    const name = email || fallback

    // Search by email_id field for exact match
    const filters = JSON.stringify([["Customer", "email_id", "=", name]])
    const found = await this.client.getList("Customer", { _raw_filters: filters }, ["name"])
    if (found.data?.length > 0) return found.data[0].name

    // Search by customer_name (covers "Walk-in Customer" case and email-as-name)
    const byName = await this.client.getListByName("Customer", name)
    if (byName) return byName

    // Create customer
    const payload: Record<string, unknown> = {
      doctype: "Customer",
      customer_name: name,
      customer_type: "Individual",
    }
    if (email) payload.email_id = email

    const result = await this.client.createDocument("Customer", payload)
    return result.data.name
  }

  async createSalesReceipt(order: OrderDTO): Promise<string> {
    const existing = await this.findExistingInvoice(order.id)
    if (existing) return existing

    const customerName = await this.ensureCustomer(order.email)

    // Ensure all line items exist in ERPNext before referencing them in the invoice
    for (const item of (order.items || []) as any[]) {
      const itemCode = item.variant_sku || item.product_handle || item.title
      await this.ensureItem(itemCode, item.title)
    }
    if (Number((order as any).shipping_total) > 0) {
      await this.ensureItem("Shipping", "Shipping")
    }

    const invoice = mapOrderToSalesInvoice(order, customerName, this.options)
    const result = await this.client.createDocument("Sales Invoice", invoice)
    return result.data.name
  }

  async voidSalesReceipt(externalId: string): Promise<void> {
    await this.client.cancelDocument("Sales Invoice", externalId)
  }

  async updateOrderStatus(externalId: string, status: string): Promise<void> {
    await this.client.updateDocument("Sales Invoice", externalId, {
      custom_status: status,
    })
  }

  // ACH deferred payment — same as Sales Invoice in ERPNext, just unpaid
  async createInvoice(order: OrderDTO): Promise<string> {
    const existing = await this.findExistingInvoice(order.id)
    if (existing) return existing

    const customerName = await this.ensureCustomer(order.email)

    // Ensure all line items exist in ERPNext before referencing them in the invoice
    for (const item of (order.items || []) as any[]) {
      const itemCode = item.variant_sku || item.product_handle || item.title
      await this.ensureItem(itemCode, item.title)
    }
    if (Number((order as any).shipping_total) > 0) {
      await this.ensureItem("Shipping", "Shipping")
    }

    const invoice = mapOrderToSalesInvoice(order, customerName, this.options)
    // ERPNext Sales Invoice starts as unpaid (Draft → Submitted)
    const result = await this.client.createDocument("Sales Invoice", invoice)
    return result.data.name
  }

  async receivePayment(invoiceExternalId: string, amount: number, currencyCode: string): Promise<string> {
    // Look up the customer on the invoice so Payment Entry matches
    const invoiceData = await this.client.getListByName("Sales Invoice", invoiceExternalId)
    const invoiceDoc = invoiceData
      ? await this.client.getDocument("Sales Invoice", encodeURIComponent(invoiceExternalId))
      : null
    const customer = invoiceDoc?.data?.customer || "Walk-in Customer"

    const result = await this.client.createDocument("Payment Entry", {
      payment_type: "Receive",
      company: this.options.company,
      party_type: "Customer",
      party: customer,
      paid_amount: amount,
      received_amount: amount,
      reference_no: invoiceExternalId,
      reference_date: new Date().toISOString().split("T")[0],
      paid_to: this.options.cash_account,
      paid_from: this.options.debit_account,
      references: [{
        reference_doctype: "Sales Invoice",
        reference_name: invoiceExternalId,
        allocated_amount: amount,
      }],
    })
    return result.data.name
  }

  async voidInvoice(externalId: string): Promise<void> {
    await this.client.cancelDocument("Sales Invoice", externalId)
  }

  async deleteInvoice(externalId: string): Promise<void> {
    // Attempt cancel first (no-op if already draft); then delete
    try { await this.client.cancelDocument("Sales Invoice", externalId) } catch { /* already draft or cancelled */ }
    await this.client.deleteDocument("Sales Invoice", externalId)
  }

  async recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    // Ensure a default walk-in customer exists for standalone payment entries
    const defaultCustomer = await this.ensureCustomer(undefined)
    const result = await this.client.createDocument("Payment Entry", {
      payment_type: "Receive",
      company: this.options.company,
      party_type: "Customer",
      party: defaultCustomer,
      paid_amount: amount,
      received_amount: amount,
      reference_no: paymentId,
      reference_date: new Date().toISOString().split("T")[0],
      paid_to: this.options.cash_account,
      paid_from: this.options.debit_account,
    })
    return result.data.name
  }

  async recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    const result = await this.client.createDocument("Journal Entry", {
      company: this.options.company,
      voucher_type: "Credit Note",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        { account: this.options.income_account, debit_in_account_currency: amount },
        { account: this.options.cash_account, credit_in_account_currency: amount },
      ],
      remark: `Refund for payment ${paymentId}`,
    })
    return result.data.name
  }

  async createCustomer(customer: CustomerDTO): Promise<string> {
    const erpCustomer = mapCustomerToErpNext(customer)
    const result = await this.client.createDocument("Customer", erpCustomer)
    return result.data.name
  }

  async updateCustomer(externalId: string, customer: CustomerDTO): Promise<void> {
    const erpCustomer = mapCustomerToErpNext(customer)
    await this.client.updateDocument("Customer", externalId, erpCustomer)
  }

  async deactivateCustomer(externalId: string): Promise<void> {
    await this.client.updateDocument("Customer", externalId, { disabled: 1 })
  }

  async createItem(product: { id: string; title: string; variants: any[] }): Promise<string> {
    const item = mapProductToErpNextItem(product)
    const result = await this.client.createDocument("Item", item)
    return result.data.name
  }

  async updateItem(externalId: string, product: { id: string; title: string; variants: any[] }): Promise<void> {
    const item = mapProductToErpNextItem(product)
    await this.client.updateDocument("Item", externalId, item)
  }

  async createDisputeRefundReceipt(dispute: {
    id: string; amount: number; currency_code: string;
    order_external_id: string; customer_external_id?: string; reason: string
  }): Promise<string> {
    const result = await this.client.createDocument("Journal Entry", {
      company: this.options.company,
      voucher_type: "Credit Note",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        { account: this.options.income_account, debit_in_account_currency: dispute.amount },
        { account: this.options.cash_account, credit_in_account_currency: dispute.amount },
      ],
      remark: `Dispute chargeback: ${dispute.reason} (Invoice: ${dispute.order_external_id})`,
    })
    return result.data.name
  }

  async voidDisputeRefundReceipt(externalId: string): Promise<void> {
    await this.client.cancelDocument("Journal Entry", externalId)
  }

  async createCreditMemo(
    orderExternalId: string,
    items: { title: string; quantity: number; unit_price: number }[],
    amount: number,
    currencyCode: string
  ): Promise<string> {
    const result = await this.client.createDocument("Sales Invoice", {
      is_return: 1,
      return_against: orderExternalId,
      items: items.map((item) => ({
        item_name: item.title,
        qty: -item.quantity,
        rate: item.unit_price / 100,
      })),
      currency: currencyCode.toUpperCase(),
    })
    return result.data.name
  }

  async getInventoryLevels(): Promise<ErpInventoryLevel[]> {
    const result = await this.client.getList("Bin", {}, [
      "item_code",
      "actual_qty",
      "warehouse",
    ])
    return (result.data || []).map((bin: any) => ({
      sku: bin.item_code,
      quantity: bin.actual_qty,
      location_id: bin.warehouse,
    }))
  }
}
