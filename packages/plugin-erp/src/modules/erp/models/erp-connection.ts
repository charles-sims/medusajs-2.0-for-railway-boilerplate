import { model } from "@medusajs/framework/utils"

const ErpConnection = model.define("erp_connection", {
  id: model.id().primaryKey(),
  provider_id: model.text(),
  access_token: model.text().default(""),
  refresh_token: model.text().default(""),
  token_expires_at: model.dateTime().nullable(),
  realm_id: model.text().nullable(),
  api_url: model.text().nullable(),
  is_connected: model.boolean().default(false),
  last_sync_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default ErpConnection
