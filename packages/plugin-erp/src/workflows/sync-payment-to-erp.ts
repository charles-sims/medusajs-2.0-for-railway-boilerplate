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
      fields: ["*", "payment_collection.*", "payment_collection.order.*"],
      filters: { id: input.payment_id },
    })

    const syncPayload = transform({ payments, input }, (data) => {
      const payment = data.payments[0]
      const event = data.input.event_name

      if (event === "payment.captured") {
        // Check if this order used ACH (invoice was created on order.placed)
        // If so, receive payment against the invoice instead of creating a new record
        const order = payment.payment_collection?.order
        const erpType = order?.metadata?.erp_type as string | undefined
        const erpIds = order?.metadata?.erp_ids as Record<string, string> | undefined

        if (erpType === "invoice" && erpIds) {
          // ACH settled — receive payment against the existing invoice
          return {
            action: "receivePayment",
            entity_id: payment.id,
            payload: [Object.values(erpIds)[0], Number(payment.amount), payment.currency_code],
          }
        }

        // CC/crypto — Sales Receipt was already created on order.placed, no-op for payment
        return {
          action: "recordPayment",
          entity_id: payment.id,
          payload: [payment.id, order?.id, Number(payment.amount), payment.currency_code],
        }
      } else if (event === "payment.refunded") {
        return {
          action: "recordRefund",
          entity_id: payment.id,
          payload: [payment.id, payment.payment_collection?.order?.id, Number(payment.amount), payment.currency_code],
        }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
