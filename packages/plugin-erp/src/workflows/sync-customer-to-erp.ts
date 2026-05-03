import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  customer_id: string
  event_name: string
}

export const syncCustomerToErpWorkflow = createWorkflow(
  "sync-customer-to-erp",
  (input: WorkflowInput) => {
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["*"],
      filters: { id: input.customer_id },
    })

    const syncPayload = transform({ customers, input }, (data) => {
      const customer = data.customers[0]
      const event = data.input.event_name

      if (event === "customer.created") {
        return { action: "createCustomer", entity_id: customer.id, payload: [customer] }
      } else if (event === "customer.updated") {
        const erpIds = customer.metadata?.erp_ids as Record<string, string> | undefined
        if (!erpIds) return { action: "createCustomer", entity_id: customer.id, payload: [customer] }
        return { action: "updateCustomer", entity_id: customer.id, payload: [Object.values(erpIds)[0], customer] }
      } else if (event === "customer.deleted") {
        const erpIds = customer.metadata?.erp_ids as Record<string, string> | undefined
        if (!erpIds) return null
        return { action: "deactivateCustomer", entity_id: customer.id, payload: [Object.values(erpIds)[0]] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
