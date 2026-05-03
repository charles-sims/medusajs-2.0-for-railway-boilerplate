import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncToErpProvidersStep } from "./steps/sync-to-erp-providers"

type WorkflowInput = {
  order_id: string
  event_name: string
}

export const syncOrderToErpWorkflow = createWorkflow(
  "sync-order-to-erp",
  (input: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "*", "items.*", "shipping_address.*", "billing_address.*",
        "shipping_methods.*", "customer.*", "summary.*",
        "total", "subtotal", "tax_total", "discount_total",
        "shipping_total", "item_total",
      ],
      filters: { id: input.order_id },
      options: { throwIfKeyNotFound: true },
    })

    const syncPayload = transform({ orders, input }, (data) => {
      const order = data.orders[0]
      const event = data.input.event_name

      if (event === "order.placed") {
        return { action: "createSalesReceipt", entity_id: order.id, payload: [order] }
      } else if (event === "order.canceled") {
        const erpIds = order.metadata?.erp_ids as Record<string, string> | undefined
        if (!erpIds) return null
        return { action: "voidSalesReceipt", entity_id: order.id, payload: [Object.values(erpIds)[0]] }
      } else if (event === "order.completed") {
        const erpIds = order.metadata?.erp_ids as Record<string, string> | undefined
        if (!erpIds) return null
        return { action: "updateOrderStatus", entity_id: order.id, payload: [Object.values(erpIds)[0], "completed"] }
      }

      return null
    })

    const results = syncToErpProvidersStep(syncPayload)
    return new WorkflowResponse(results)
  }
)
