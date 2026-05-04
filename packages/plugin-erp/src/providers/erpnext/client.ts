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

  async deleteDocument(doctype: string, name: string): Promise<any> {
    return this.fetchWithRetry(`${doctype}/${encodeURIComponent(name)}`, { method: "DELETE" })
  }

  async submitDocument(doctype: string, name: string): Promise<any> {
    const response = await fetch(`${this.options.api_url}/api/method/frappe.client.submit`, {
      method: "POST",
      headers: {
        Authorization: `token ${this.options.api_key}:${this.options.api_secret}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ doc: JSON.stringify({ doctype, name }) }),
    })
    if (!response.ok) {
      const body = await response.text()
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `ERPNext submit error ${response.status}: ${body}`
      )
    }
    return response.json()
  }

  async cancelDocument(doctype: string, name: string): Promise<any> {
    const response = await fetch(`${this.options.api_url}/api/method/frappe.client.cancel`, {
      method: "POST",
      headers: {
        Authorization: `token ${this.options.api_key}:${this.options.api_secret}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ doctype, name }),
    })
    if (!response.ok) {
      const body = await response.text()
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `ERPNext cancel error ${response.status}: ${body}`
      )
    }
    return response.json()
  }

  async getList(doctype: string, filters?: Record<string, unknown>, fields?: string[]): Promise<any> {
    const params = new URLSearchParams()
    if (filters && !filters._raw_filters) params.set("filters", JSON.stringify(filters))
    if (filters?._raw_filters) params.set("filters", filters._raw_filters as string)
    if (fields) params.set("fields", JSON.stringify(fields))
    return this.fetchWithRetry(`${doctype}?${params.toString()}`)
  }

  async getListByName(doctype: string, name: string): Promise<string | null> {
    try {
      const result = await this.fetchWithRetry(`${doctype}/${encodeURIComponent(name)}`)
      return result.data?.name ?? null
    } catch {
      return null
    }
  }
}
