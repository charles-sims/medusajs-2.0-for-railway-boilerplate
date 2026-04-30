import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateCartsStep } from "@medusajs/medusa/core-flows"
import { sendAbandonedNotificationsStep } from "./steps/send-abandoned-notifications"

type WorkflowInput = {
  carts: any[]
}

export const sendAbandonedCartsWorkflow = createWorkflow(
  "send-abandoned-carts",
  ({ carts }: WorkflowInput) => {
    sendAbandonedNotificationsStep({ carts })

    const cartUpdates = transform({ carts }, ({ carts }) =>
      carts.map((cart: any) => ({
        id: cart.id,
        metadata: {
          ...cart.metadata,
          abandoned_notification: new Date().toISOString(),
        },
      }))
    )

    updateCartsStep(cartUpdates)

    return new WorkflowResponse({ carts })
  }
)
