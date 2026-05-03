import { OrderDTO, CustomerDTO } from "@medusajs/framework/types"

export type ConnectionStatus = {
  connected: boolean
  provider_id: string
  last_sync_at: string | null
  token_expires_at: string | null
  realm_id: string | null
}

export type ErpInventoryLevel = {
  sku: string
  quantity: number
  location_id?: string
}

export type SyncResult = {
  external_id: string
  provider_id: string
}

export interface IErpProvider {
  identifier: string

  // Connection
  isConnected(): Promise<boolean>
  getConnectionStatus(): Promise<ConnectionStatus>

  // Orders — instant payment (CC/crypto)
  createSalesReceipt(order: OrderDTO): Promise<string>
  voidSalesReceipt(externalId: string): Promise<void>
  updateOrderStatus(externalId: string, status: string): Promise<void>

  // Orders — deferred payment (ACH)
  createInvoice(order: OrderDTO): Promise<string>
  receivePayment(invoiceExternalId: string, amount: number, currencyCode: string): Promise<string>
  voidInvoice(externalId: string): Promise<void>

  // Payments
  recordPayment(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string>
  recordRefund(paymentId: string, orderId: string, amount: number, currencyCode: string): Promise<string>

  // Customers
  createCustomer(customer: CustomerDTO): Promise<string>
  updateCustomer(externalId: string, customer: CustomerDTO): Promise<void>
  deactivateCustomer(externalId: string): Promise<void>

  // Products
  createItem(product: { id: string; title: string; variants: any[]; metadata?: Record<string, unknown> }): Promise<string>
  updateItem(externalId: string, product: { id: string; title: string; variants: any[]; metadata?: Record<string, unknown> }): Promise<void>

  // Disputes
  createDisputeRefundReceipt(dispute: {
    id: string
    amount: number
    currency_code: string
    order_external_id: string
    customer_external_id?: string
    reason: string
  }): Promise<string>
  voidDisputeRefundReceipt(externalId: string): Promise<void>

  // Returns & Exchanges
  createCreditMemo(orderExternalId: string, items: { title: string; quantity: number; unit_price: number }[], amount: number, currencyCode: string): Promise<string>

  // Inventory (pull)
  getInventoryLevels(): Promise<ErpInventoryLevel[]>
}

export type ErpModuleOptions = {
  encryption_key?: string
}
