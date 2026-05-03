import { MedusaContainer } from "@medusajs/framework/types"
import { ERP_MODULE } from "../modules/erp"
import OAuthClient from "intuit-oauth"

export default async function qboTokenRefreshJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const erpService = container.resolve(ERP_MODULE) as any

  const conn = await erpService.getConnection("quickbooks")
  if (!conn?.is_connected || !conn?.refresh_token) {
    return
  }

  const expiresAt = new Date(conn.token_expires_at).getTime()
  const now = Date.now()
  const tenMinutes = 10 * 60 * 1000

  if (expiresAt - now > tenMinutes) {
    return
  }

  logger.info("Refreshing QBO access token...")

  try {
    const oauthClient = new OAuthClient({
      clientId: process.env.QBO_CLIENT_ID!,
      clientSecret: process.env.QBO_CLIENT_SECRET!,
      environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
      redirectUri: process.env.QBO_REDIRECT_URI!,
    })

    oauthClient.setToken({
      access_token: conn.access_token,
      refresh_token: conn.refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      x_refresh_token_expires_in: 8726400,
      realmId: conn.realm_id,
    })

    const authResponse = await oauthClient.refresh()
    const token = authResponse.getJson()

    await erpService.upsertConnection({
      provider_id: "quickbooks",
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_expires_at: new Date(Date.now() + token.expires_in * 1000),
      is_connected: true,
    })

    logger.info("QBO token refreshed successfully")
  } catch (error: any) {
    logger.error("QBO token refresh failed:", error.message)
  }
}

export const config = {
  name: "qbo-token-refresh",
  schedule: "*/50 * * * *",
}
