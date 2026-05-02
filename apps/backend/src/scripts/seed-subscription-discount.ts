import { 
  IPromotionModuleService
} from "@medusajs/framework/types"
import { Modules, PromotionType } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import { SUBSCRIPTION_PROMOTION_CODE } from "../constants/subscription-discount"

export default async function seedSubscriptionDiscount({ container }: ExecArgs) {
  const promotionModuleService: IPromotionModuleService = container.resolve(
    Modules.PROMOTION
  )

  const [existing] = await promotionModuleService.listPromotions({
    code: [SUBSCRIPTION_PROMOTION_CODE]
  })

  if (existing) {
    console.log("Subscription discount promotion already exists.")
    return
  }

  console.log("Creating subscription discount promotion...")
  await promotionModuleService.createPromotions([
    {
      code: SUBSCRIPTION_PROMOTION_CODE,
      type: PromotionType.STANDARD,
      application_method: {
        type: "percentage",
        target_type: "items",
        value: 15,
        currency_code: "usd",
        allocation: "across"
      },
      is_automatic: false, // We apply it manually via workflow
      rules: []
    }
  ])
  console.log("Subscription discount promotion created.")
}
