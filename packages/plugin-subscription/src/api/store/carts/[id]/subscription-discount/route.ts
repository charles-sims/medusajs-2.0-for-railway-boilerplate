import {
  MedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import { subscriptionDiscountWorkflow } from "../../../../../workflows/subscription-discount"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { action } = req.body as { action: "add" | "remove" }

  const { result } = await subscriptionDiscountWorkflow(req.scope)
    .run({
      input: {
        cart_id: req.params.id,
        action
      }
    })

  res.json(result)
}
