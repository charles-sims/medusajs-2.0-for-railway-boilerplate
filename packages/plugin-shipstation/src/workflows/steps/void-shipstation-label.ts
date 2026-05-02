import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { IFulfillmentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export const voidShipStationLabelStep = createStep(
  "void-shipstation-label",
  async (id: string, { container }) => {
    const fulfillmentModule: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    // This triggers the provider's cancelFulfillment method
    await fulfillmentModule.cancelFulfillment(id)

    return new StepResponse({ success: true }, id)
  }
)
