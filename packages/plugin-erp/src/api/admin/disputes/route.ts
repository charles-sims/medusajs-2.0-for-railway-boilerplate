import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DISPUTE_MODULE } from "../../../modules/dispute"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const disputes = await disputeService.listDisputes({})
  res.json({ disputes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
  const dispute = await disputeService.createDisputes(req.body)
  res.status(201).json({ dispute })
}
