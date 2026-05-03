import { IErpProvider, ConnectionStatus, ErpInventoryLevel } from "../../modules/erp/types"
import { QboClient } from "./client"
import { QboOptions } from "./types"
import { mapOrderToSalesReceipt, mapOrderToInvoice, mapCustomerToQbo, mapProductToQboItem, mapDisputeToRefundReceipt } from "./mappers"
import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export class QboErpProviderService implements IErpProvider {
  static identifier = "quickbooks"
  identifier = "quickbooks"

  private client: QboClient
  private erpService: any

  constructor(private container: Record<string, any>, options: QboOptions) {
    this.client = new QboClient(options)
  }

  private async ensureClient(): Promise<void> {
    if (!this.erpService) {
      this.erpService = this.container.erp || (typeof this.container.resolve === "function" ? this.container.resolve("erp") : null)
    }
    if (!this.erpService) return
    const conn = await this.erpService.getConnection("quickbooks")
    if (conn?.access_token && conn?.realm_id) {
      this.client.setCredentials(conn.access_token, conn.realm_id)
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.ensureClient()
      await this.client.query("SELECT Id FROM CompanyInfo")
      return true
    } catch {
      return false
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const conn = this.erpService ? await this.erpService.getConnection("quickbooks") : null
    return {
      connected: conn?.is_connected ?? false,
      provider_id: "quickbooks",
      last_sync_at: conn?.last_sync_at?.toISOString() ?? null,
      token_expires_at: conn?.token_expires_at?.toISOString() ?? null,
      realm_id: conn?.realm_id ?? null,
    }
  }

  async createSalesReceipt(order: OrderDTO): Promise<string> {
    await this.ensureClient()
    const receipt = mapOrderToSalesReceipt(order)
    const result = await this.client.createSalesReceipt(receipt)
    return result.SalesReceipt.Id
  }

  async voidSalesReceipt(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getSalesReceipt(externalId)
    await this.client.voidSalesReceipt(externalId, existing.SalesReceipt.SyncToken)
  }

  async updateOrderStatus(externalId: string, status: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getSalesReceipt(externalId)
    await this.client.createSalesReceipt({
      ...existing.SalesReceipt,
      PrivateNote: `${existing.SalesReceipt.PrivateNote || ""} | Status: ${status}`,
      sparse: true,
    })
  }

  async createInvoice(order: OrderDTO): Promise<string> {
    await this.ensureClient()
    const invoice = mapOrderToInvoice(order)
    const result = await this.client.createInvoice(invoice)
    return result.Invoice.Id
  }

  async receivePayment(invoiceExternalId: string, amount: number, currencyCode: string): Promise<string> {
    await this.ensureClient()
    const result = await this.client.createPayment({
      CustomerRef: { value: "1" },
      TotalAmt: amount / 100,
      CurrencyRef: { value: currencyCode.toUpperCase() },
      Line: [{
        Amount: amount / 100,
        LinkedTxn: [{ TxnId: invoiceExternalId, TxnType: "Invoice" }],
      }],
      PrivateNote: `ACH payment settled for Invoice ${invoiceExternalId}`,
    })
    return result.Payment.Id
  }

  async voidInvoice(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getInvoice(externalId)
    await this.client.voidInvoice(externalId, existing.Invoice.SyncToken)
  }

  async recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    return `payment-${paymentId}`
  }

  async recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string> {
    await this.ensureClient()
    const refund = await this.client.createRefundReceipt({
      CustomerRef: { value: "1" },
      Line: [{
        Amount: amount / 100,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: "Refund" },
          Qty: 1,
          UnitPrice: amount / 100,
        },
        Description: `Refund for payment ${paymentId}`,
      }],
      CurrencyRef: { value: currencyCode.toUpperCase() },
      PrivateNote: `Medusa refund for payment ${paymentId}`,
    })
    return refund.RefundReceipt.Id
  }

  async createCustomer(customer: CustomerDTO): Promise<string> {
    await this.ensureClient()
    const qboCustomer = mapCustomerToQbo(customer)
    const result = await this.client.createCustomer(qboCustomer)
    return result.Customer.Id
  }

  async updateCustomer(externalId: string, customer: CustomerDTO): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getCustomer(externalId)
    const qboCustomer = mapCustomerToQbo(customer)
    await this.client.updateCustomer({
      ...qboCustomer,
      Id: externalId,
      SyncToken: existing.Customer.SyncToken,
      sparse: true,
    })
  }

  async deactivateCustomer(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.getCustomer(externalId)
    await this.client.updateCustomer({
      Id: externalId,
      SyncToken: existing.Customer.SyncToken,
      Active: false,
      sparse: true,
    })
  }

  async createItem(product: { id: string; title: string; variants: any[] }): Promise<string> {
    await this.ensureClient()
    const item = mapProductToQboItem(product)
    const result = await this.client.createItem(item)
    return result.Item.Id
  }

  async updateItem(externalId: string, product: { id: string; title: string; variants: any[] }): Promise<void> {
    await this.ensureClient()
    const item = mapProductToQboItem(product)
    await this.client.updateItem({
      ...item,
      Id: externalId,
      sparse: true,
    })
  }

  async createDisputeRefundReceipt(dispute: {
    id: string; amount: number; currency_code: string;
    order_external_id: string; customer_external_id?: string; reason: string
  }): Promise<string> {
    await this.ensureClient()
    const refund = mapDisputeToRefundReceipt(dispute)
    const result = await this.client.createRefundReceipt(refund)
    return result.RefundReceipt.Id
  }

  async voidDisputeRefundReceipt(externalId: string): Promise<void> {
    await this.ensureClient()
    const existing = await this.client.createRefundReceipt({ Id: externalId })
    await this.client.voidRefundReceipt(externalId, existing.RefundReceipt?.SyncToken || "0")
  }

  async createCreditMemo(
    orderExternalId: string,
    items: { title: string; quantity: number; unit_price: number }[],
    amount: number,
    currencyCode: string
  ): Promise<string> {
    await this.ensureClient()
    const memo = await this.client.createCreditMemo({
      CustomerRef: { value: "1" },
      Line: items.map((item) => ({
        Amount: (item.unit_price * item.quantity) / 100,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: item.title },
          Qty: item.quantity,
          UnitPrice: item.unit_price / 100,
        },
        Description: item.title,
      })),
      CurrencyRef: { value: currencyCode.toUpperCase() },
      PrivateNote: `Credit memo for Sales Receipt ${orderExternalId}`,
    })
    return memo.CreditMemo.Id
  }

  async getInventoryLevels(): Promise<ErpInventoryLevel[]> {
    return []
  }
}
