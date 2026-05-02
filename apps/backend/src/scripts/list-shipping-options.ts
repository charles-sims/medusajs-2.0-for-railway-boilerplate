import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listShippingOptions({ container }: ExecArgs) {
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const shippingOptions = await fulfillmentModuleService.listShippingOptions(
    {},
    { relations: ["type"] }
  )

  logger.info("Current Shipping Options:")
  shippingOptions.forEach((so: any) => {
    logger.info(`- ${so.name} (Provider: ${so.provider_id}): Price Type = ${so.price_type}`)
    if (so.metadata) {
      logger.info(`  Metadata: ${JSON.stringify(so.metadata)}`)
    }
  })
}
