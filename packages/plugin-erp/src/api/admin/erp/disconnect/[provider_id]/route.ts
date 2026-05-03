import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ERP_MODULE } from "../../../../../modules/erp"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params
  const erpService = req.scope.resolve(ERP_MODULE) as any

  await erpService.upsertConnection({
    provider_id,
    access_token: "",
    refresh_token: "",
    is_connected: false,
  })

  res.json({ disconnected: true, provider_id })
}
