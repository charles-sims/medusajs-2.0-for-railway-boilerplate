import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { voidShipStationLabelStep } from "./steps/void-shipstation-label"

export const voidShipStationLabelWorkflow = createWorkflow(
  "void-shipstation-label",
  function (input: { fulfillment_id: string }) {
    const result = voidShipStationLabelStep(input.fulfillment_id)

    return new WorkflowResponse(result)
  }
)
