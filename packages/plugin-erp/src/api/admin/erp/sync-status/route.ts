import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ERP_MODULE } from "../../../../modules/erp"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const erpService = req.scope.resolve(ERP_MODULE) as any
  const providers = erpService.getAllProviders()

  const statuses: Record<string, any> = {}
  for (const provider of providers) {
    statuses[provider.identifier] = await provider.getConnectionStatus()
  }

  res.json({ providers: statuses })
}
