import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DISPUTE_MODULE } from "../../../../modules/dispute"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const dispute = await disputeService.retrieveDispute(id)
  res.json({ dispute })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const body = req.body as Record<string, unknown>
  const dispute = await disputeService.updateDisputes({ id, ...body })
  res.json({ dispute })
}
