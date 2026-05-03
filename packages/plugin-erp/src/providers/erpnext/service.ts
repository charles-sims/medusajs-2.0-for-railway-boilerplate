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
    const customerName = await this.ensureCustomer(order.email)
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
    const customerName = await this.ensureCustomer(order.email)
    const invoice = mapOrderToSalesInvoice(order, customerName, this.options)
    // ERPNext Sales Invoice starts as unpaid (Draft → Submitted)
    const result = await this.client.createDocument("Sales Invoice", invoice)
    return result.data.name
  }

  async receivePayment(invoiceExternalId: string, amount: number, currencyCode: string): Promise<string> {
    const result = await this.client.createDocument("Payment Entry", {
      payment_type: "Receive",
      party_type: "Customer",
      party: "Walk-in Customer",
      paid_amount: amount / 100,
      received_amount: amount / 100,
      reference_no: invoiceExternalId,
      reference_date: new Date().toISOString().split("T")[0],
      paid_to: "Cash - C",
      paid_from: "Debtors - C",
      references: [{
        reference_doctype: "Sales Invoice",
        reference_name: invoiceExternalId,
        allocated_amount: amount / 100,
      }],
    })
    return result.data.name
  }

  async voidInvoice(externalId: string): Promise<void> {
    await this.client.cancelDocument("Sales Invoice", externalId)
  }

  async recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    const result = await this.client.createDocument("Payment Entry", {
      payment_type: "Receive",
      party_type: "Customer",
      party: "Walk-in Customer",
      paid_amount: amount / 100,
      received_amount: amount / 100,
      reference_no: paymentId,
      reference_date: new Date().toISOString().split("T")[0],
      paid_to: "Cash - C",
      paid_from: "Debtors - C",
    })
    return result.data.name
  }

  async recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    const result = await this.client.createDocument("Journal Entry", {
      voucher_type: "Credit Note",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        { account: "Sales - C", debit_in_account_currency: amount / 100 },
        { account: "Cash - C", credit_in_account_currency: amount / 100 },
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
      voucher_type: "Credit Note",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        { account: "Sales - C", debit_in_account_currency: dispute.amount / 100 },
        { account: "Cash - C", credit_in_account_currency: dispute.amount / 100 },
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
