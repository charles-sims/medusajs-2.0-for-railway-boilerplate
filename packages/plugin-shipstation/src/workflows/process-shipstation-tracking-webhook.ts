import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  processShipStationTrackingWebhookStep,
  ShipStationTrackingWebhookInput,
} from "./steps/process-shipstation-tracking-webhook"

export const processShipStationTrackingWebhookWorkflow = createWorkflow(
  "process-shipstation-tracking-webhook",
  function (input: ShipStationTrackingWebhookInput) {
    const result = processShipStationTrackingWebhookStep(input)

    return new WorkflowResponse(result)
  }
)
