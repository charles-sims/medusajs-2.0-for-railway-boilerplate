import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  payment_id: string
  event_name: string
}

export const syncPaymentToErpWorkflow = createWorkflow(
  "sync-payment-to-erp",
  (input: WorkflowInput) => {
    const { data: payments } = useQueryGraphStep({
      entity: "payment",
      fields: ["*", "payment_collection.*"],
      filters: { id: input.payment_id },
    })

    const syncPayload = transform({ payments, input }, (data) => {
      const payment = data.payments[0]
      const event = data.input.event_name

      if (event === "payment.captured") {
        return {
          action: "recordPayment",
          entity_id: payment.id,
          payload: [payment.id, payment.payment_collection?.id, Number(payment.amount), payment.currency_code],
        }
      } else if (event === "payment.refunded") {
        return {
          action: "recordRefund",
          entity_id: payment.id,
          payload: [payment.id, payment.payment_collection?.id, Number(payment.amount), payment.currency_code],
        }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
