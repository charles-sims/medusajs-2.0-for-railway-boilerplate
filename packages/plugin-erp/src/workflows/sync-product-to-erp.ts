import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  product_id: string
  event_name: string
}

export const syncProductToErpWorkflow = createWorkflow(
  "sync-product-to-erp",
  (input: WorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["*", "variants.*"],
      filters: { id: input.product_id },
    })

    const syncPayload = transform({ products, input }, (data) => {
      const product = data.products[0]
      const event = data.input.event_name

      if (event === "product.created") {
        return { action: "createItem", entity_id: product.id, payload: [product] }
      } else if (event === "product.updated") {
        const erpIds = product.metadata?.erp_ids as Record<string, string> | undefined
        if (!erpIds) return { action: "createItem", entity_id: product.id, payload: [product] }
        return { action: "updateItem", entity_id: product.id, payload: [Object.values(erpIds)[0], product] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
