import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DISPUTE_MODULE } from "../../../../../modules/dispute"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { provider_id } = req.params
  const logger = req.scope.resolve("logger")

  try {
    const disputeService = req.scope.resolve(DISPUTE_MODULE) as any
    const body = req.body as Record<string, unknown>

    const dispute = await disputeService.createDisputes({
      status: "open",
      reason: (body.reason as string) || "chargeback",
      amount: body.amount as number,
      currency_code: (body.currency_code as string) || "usd",
      provider_dispute_id: (body.dispute_id as string) || "",
      payment_provider: provider_id,
      evidence_submitted: false,
      metadata: body,
    })

    logger.info(`Dispute created from webhook [${provider_id}]: ${dispute.id}`)
    res.status(200).json({ received: true, dispute_id: dispute.id })
  } catch (error: any) {
    logger.error(`Dispute webhook error [${provider_id}]:`, error)
    res.status(500).json({ error: error.message })
  }
}
