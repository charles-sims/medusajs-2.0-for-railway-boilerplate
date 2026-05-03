import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import OAuthClient from "intuit-oauth"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params

  if (provider_id !== "quickbooks") {
    return res.status(400).json({ error: "OAuth connect only supported for quickbooks" })
  }

  const oauthClient = new OAuthClient({
    clientId: process.env.QBO_CLIENT_ID!,
    clientSecret: process.env.QBO_CLIENT_SECRET!,
    environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    redirectUri: process.env.QBO_REDIRECT_URI!,
  })

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: "medusa-erp-connect",
  })

  res.redirect(authUri)
}
