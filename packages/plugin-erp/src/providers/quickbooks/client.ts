import { MedusaError } from "@medusajs/framework/utils"
import { QboOptions } from "./types"

const SANDBOX_BASE_URL = "https://sandbox-quickbooks.api.intuit.com"
const PRODUCTION_BASE_URL = "https://quickbooks.api.intuit.com"

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export class QboClient {
  private options: QboOptions
  private baseUrl: string
  private accessToken: string | null = null
  private realmId: string | null = null

  constructor(options: QboOptions) {
    this.options = options
    this.baseUrl = options.environment === "production"
      ? PRODUCTION_BASE_URL
      : SANDBOX_BASE_URL
  }

  setCredentials(accessToken: string, realmId: string): void {
    this.accessToken = accessToken
    this.realmId = realmId
  }

  private async fetchWithRetry(url: string, init?: RequestInit, retries = MAX_RETRIES): Promise<any> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const body = await response.text()
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `QBO API error ${response.status}: ${body}`
          )
        }

        return await response.json()
      } catch (error: any) {
        lastError = error
        const isRetryable =
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT" ||
          error.code === "UND_ERR_SOCKET"

        if (isRetryable && attempt < retries) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          break
        }
      }
    }

    throw lastError
  }

  private url(endpoint: string): string {
    return `${this.baseUrl}/v3/company/${this.realmId}/${endpoint}`
  }

  async createSalesReceipt(receipt: any): Promise<any> {
    return this.fetchWithRetry(this.url("salesreceipt"), {
      method: "POST",
      body: JSON.stringify(receipt),
    })
  }

  async voidSalesReceipt(id: string, syncToken: string): Promise<any> {
    return this.fetchWithRetry(this.url("salesreceipt?operation=void"), {
      method: "POST",
      body: JSON.stringify({ Id: id, SyncToken: syncToken, sparse: true }),
    })
  }

  async getSalesReceipt(id: string): Promise<any> {
    return this.fetchWithRetry(this.url(`salesreceipt/${id}`))
  }

  async createCustomer(customer: any): Promise<any> {
    return this.fetchWithRetry(this.url("customer"), {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  async updateCustomer(customer: any): Promise<any> {
    return this.fetchWithRetry(this.url("customer"), {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  async getCustomer(id: string): Promise<any> {
    return this.fetchWithRetry(this.url(`customer/${id}`))
  }

  async createItem(item: any): Promise<any> {
    return this.fetchWithRetry(this.url("item"), {
      method: "POST",
      body: JSON.stringify(item),
    })
  }

  async updateItem(item: any): Promise<any> {
    return this.fetchWithRetry(this.url("item"), {
      method: "POST",
      body: JSON.stringify(item),
    })
  }

  // --- Invoices (ACH deferred payment) ---

  async createInvoice(invoice: any): Promise<any> {
    return this.fetchWithRetry(this.url("invoice"), {
      method: "POST",
      body: JSON.stringify(invoice),
    })
  }

  async getInvoice(id: string): Promise<any> {
    return this.fetchWithRetry(this.url(`invoice/${id}`))
  }

  async voidInvoice(id: string, syncToken: string): Promise<any> {
    return this.fetchWithRetry(this.url("invoice?operation=void"), {
      method: "POST",
      body: JSON.stringify({ Id: id, SyncToken: syncToken, sparse: true }),
    })
  }

  // --- Payments (receive payment against invoice) ---

  async createPayment(payment: any): Promise<any> {
    return this.fetchWithRetry(this.url("payment"), {
      method: "POST",
      body: JSON.stringify(payment),
    })
  }

  // --- Refund Receipts ---

  async createRefundReceipt(refund: any): Promise<any> {
    return this.fetchWithRetry(this.url("refundreceipt"), {
      method: "POST",
      body: JSON.stringify(refund),
    })
  }

  async voidRefundReceipt(id: string, syncToken: string): Promise<any> {
    return this.fetchWithRetry(this.url("refundreceipt?operation=void"), {
      method: "POST",
      body: JSON.stringify({ Id: id, SyncToken: syncToken, sparse: true }),
    })
  }

  async createCreditMemo(memo: any): Promise<any> {
    return this.fetchWithRetry(this.url("creditmemo"), {
      method: "POST",
      body: JSON.stringify(memo),
    })
  }

  async query(queryString: string): Promise<any> {
    const encoded = encodeURIComponent(queryString)
    return this.fetchWithRetry(this.url(`query?query=${encoded}`))
  }
}
