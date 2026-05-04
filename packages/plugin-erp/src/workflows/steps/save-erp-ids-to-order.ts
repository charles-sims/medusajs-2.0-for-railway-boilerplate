import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { SyncResult } from "../../modules/erp/types"

type SaveErpIdsInput = {
  order_id: string
  results: SyncResult[]
  erp_type: "invoice" | "sales_receipt"
} | null

export const saveErpIdsToOrderStep = createStep(
  "save-erp-ids-to-order",
  async (input: SaveErpIdsInput, { container }) => {
    if (!input || !input.results?.length) return new StepResponse(null)

    const erp_ids: Record<string, string> = {}
    for (const result of input.results) {
      erp_ids[result.provider_id] = result.external_id
    }

    const orderService = container.resolve(Modules.ORDER) as any
    await orderService.updateOrders([{
      id: input.order_id,
      metadata: { erp_ids, erp_type: input.erp_type },
    }])

    return new StepResponse({ erp_ids, erp_type: input.erp_type })
  }
)
