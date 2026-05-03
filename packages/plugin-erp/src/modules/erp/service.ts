import { MedusaService } from "@medusajs/framework/utils"
import ErpConnection from "./models/erp-connection"
import { IErpProvider, ErpModuleOptions } from "./types"
import crypto from "crypto"
import { QboErpProviderService } from "../../providers/quickbooks"
import { ErpNextProviderService } from "../../providers/erpnext"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16

class ErpModuleService extends MedusaService({
  ErpConnection,
}) {
  private providers_: Map<string, IErpProvider> = new Map()
  private encryptionKey_: string | null

  constructor(container: Record<string, unknown>, options: ErpModuleOptions) {
    super(...arguments)
    this.encryptionKey_ = (options?.encryption_key || process.env.ERP_ENCRYPTION_KEY) ?? null
    
    this.registerInternalProviders(container)
  }

  private registerInternalProviders(container: any): void {
    // Register QuickBooks Provider
    if (process.env.QBO_CLIENT_ID) {
      this.registerProvider(
        new QboErpProviderService(container, {
          client_id: process.env.QBO_CLIENT_ID,
          client_secret: process.env.QBO_CLIENT_SECRET!,
          redirect_uri: process.env.QBO_REDIRECT_URI!,
          environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
        })
      )
    }

    // Register ERPNext Provider
    if (process.env.ERPNEXT_API_URL) {
      this.registerProvider(
        new ErpNextProviderService(container, {
          api_url: process.env.ERPNEXT_API_URL,
          api_key: process.env.ERPNEXT_API_KEY!,
          api_secret: process.env.ERPNEXT_API_SECRET!,
        })
      )
    }
  }

  registerProvider(provider: IErpProvider): void {
    this.providers_.set(provider.identifier, provider)
  }

  getProvider(providerId: string): IErpProvider {
    const provider = this.providers_.get(providerId)
    if (!provider) {
      throw new Error(`ERP provider "${providerId}" is not registered`)
    }
    return provider
  }

  getAllProviders(): IErpProvider[] {
    return Array.from(this.providers_.values())
  }

  encrypt(text: string): string {
    if (!this.encryptionKey_) {
      return text
    }
    const key = Buffer.from(this.encryptionKey_, "hex")
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    const authTag = cipher.getAuthTag()
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
  }

  decrypt(encryptedText: string): string {
    if (!this.encryptionKey_) {
      return encryptedText
    }
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      return encryptedText
    }
    const key = Buffer.from(this.encryptionKey_, "hex")
    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(parts[2], "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  }

  async getConnection(providerId: string): Promise<any | null> {
    const connections = await this.listErpConnections({
      provider_id: providerId,
    })
    const conn = connections[0] ?? null
    if (conn && conn.access_token) {
      conn.access_token = this.decrypt(conn.access_token)
    }
    if (conn && conn.refresh_token) {
      conn.refresh_token = this.decrypt(conn.refresh_token)
    }
    return conn
  }

  async upsertConnection(data: {
    provider_id: string
    access_token?: string
    refresh_token?: string
    token_expires_at?: Date
    realm_id?: string
    api_url?: string
    is_connected?: boolean
    last_sync_at?: Date
    metadata?: Record<string, unknown>
  }): Promise<any> {
    const existing = await this.getConnection(data.provider_id)

    const toSave = { ...data }
    if (toSave.access_token) {
      toSave.access_token = this.encrypt(toSave.access_token)
    }
    if (toSave.refresh_token) {
      toSave.refresh_token = this.encrypt(toSave.refresh_token)
    }

    if (existing) {
      return this.updateErpConnections({
        id: existing.id,
        ...toSave,
      })
    }

    return this.createErpConnections(toSave)
  }
}

export default ErpModuleService
