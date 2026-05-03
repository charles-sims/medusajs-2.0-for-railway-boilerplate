import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  dispute_id: string
  event_name: string
}

export const syncDisputeToErpWorkflow = createWorkflow(
  "sync-dispute-to-erp",
  (input: WorkflowInput) => {
    const { data: disputes } = useQueryGraphStep({
      entity: "dispute",
      fields: ["*"],
      filters: { id: input.dispute_id },
    })

    const syncPayload = transform({ disputes, input }, (data) => {
      const dispute = data.disputes[0]
      const event = data.input.event_name

      if (event === "dispute.created") {
        return {
          action: "createDisputeRefundReceipt",
          entity_id: dispute.id,
          payload: [{
            id: dispute.id,
            amount: Number(dispute.amount),
            currency_code: dispute.currency_code,
            order_external_id: "",
            reason: dispute.reason,
          }],
        }
      } else if (event === "dispute.won") {
        const erpIds = dispute.metadata?.erp_ids as Record<string, string> | undefined
        if (!erpIds) return null
        return { action: "voidDisputeRefundReceipt", entity_id: dispute.id, payload: [Object.values(erpIds)[0]] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
