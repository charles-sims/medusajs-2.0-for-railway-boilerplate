import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import OAuthClient from "intuit-oauth"
import { ERP_MODULE } from "../../../../../../modules/erp"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params

  if (provider_id !== "quickbooks") {
    return res.status(400).json({ error: "OAuth callback only supported for quickbooks" })
  }

  const oauthClient = new OAuthClient({
    clientId: process.env.QBO_CLIENT_ID!,
    clientSecret: process.env.QBO_CLIENT_SECRET!,
    environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    redirectUri: process.env.QBO_REDIRECT_URI!,
  })

  try {
    const authResponse = await oauthClient.createToken(req.url!)
    const token = authResponse.getJson()

    const erpService = req.scope.resolve(ERP_MODULE) as any
    await erpService.upsertConnection({
      provider_id: "quickbooks",
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      token_expires_at: new Date(Date.now() + token.expires_in * 1000),
      realm_id: token.realmId,
      is_connected: true,
    })

    res.redirect("/app/settings")
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
