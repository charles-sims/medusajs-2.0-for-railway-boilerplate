import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { voidShipStationLabelWorkflow } from "../../../../../../workflows/void-shipstation-label"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  const { result } = await voidShipStationLabelWorkflow(req.scope)
    .run({
      input: {
        fulfillment_id: id
      }
    })

  res.status(200).json({ result })
}
