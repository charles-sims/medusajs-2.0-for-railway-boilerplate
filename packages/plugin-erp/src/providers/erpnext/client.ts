import { MedusaError } from "@medusajs/framework/utils"
import { ErpNextOptions } from "./types"

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export class ErpNextClient {
  private options: ErpNextOptions

  constructor(options: ErpNextOptions) {
    this.options = options
  }

  private async fetchWithRetry(endpoint: string, init?: RequestInit, retries = MAX_RETRIES): Promise<any> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = `${this.options.api_url}/api/resource/${endpoint}`
        const response = await fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `token ${this.options.api_key}:${this.options.api_secret}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const body = await response.text()
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `ERPNext API error ${response.status}: ${body}`
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

  async createDocument(doctype: string, data: Record<string, unknown>): Promise<any> {
    return this.fetchWithRetry(doctype, {
      method: "POST",
      body: JSON.stringify({ data }),
    })
  }

  async updateDocument(doctype: string, name: string, data: Record<string, unknown>): Promise<any> {
    return this.fetchWithRetry(`${doctype}/${name}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    })
  }

  async getDocument(doctype: string, name: string): Promise<any> {
    return this.fetchWithRetry(`${doctype}/${name}`)
  }

  async cancelDocument(doctype: string, name: string): Promise<any> {
    const url = `${this.options.api_url}/api/method/frappe.client.cancel`
    return this.fetchWithRetry("", {
      method: "POST",
      body: JSON.stringify({ doctype, name }),
    })
  }

  async getList(doctype: string, filters?: Record<string, unknown>, fields?: string[]): Promise<any> {
    const params = new URLSearchParams()
    if (filters) params.set("filters", JSON.stringify(filters))
    if (fields) params.set("fields", JSON.stringify(fields))
    return this.fetchWithRetry(`${doctype}?${params.toString()}`)
  }
}
