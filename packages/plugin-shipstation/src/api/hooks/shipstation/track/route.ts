import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { processShipStationTrackingWebhookWorkflow } from "../../../../workflows/process-shipstation-tracking-webhook"
import { ShipStationTrackingWebhookInput } from "../../../../workflows/steps/process-shipstation-tracking-webhook"

const SECRET_HEADER = "x-shipstation-webhook-secret"

const getHeader = (req: MedusaRequest, name: string): string | undefined => {
  const value = req.headers[name]

  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export const POST = async (
  req: MedusaRequest<ShipStationTrackingWebhookInput>,
  res: MedusaResponse
) => {
  const configuredSecret = process.env.SHIPSTATION_WEBHOOK_SECRET

  if (!configuredSecret) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "ShipStation webhook secret is not configured"
    )
  }

  const providedSecret = getHeader(req, SECRET_HEADER)

  if (!providedSecret || providedSecret !== configuredSecret) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Invalid ShipStation webhook secret"
    )
  }

  const { result } = await processShipStationTrackingWebhookWorkflow(req.scope)
    .run({
      input: req.body as ShipStationTrackingWebhookInput,
    })

  res.status(200).json({ result })
}
