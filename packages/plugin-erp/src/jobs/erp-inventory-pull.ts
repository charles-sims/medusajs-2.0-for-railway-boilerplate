import { MedusaContainer } from "@medusajs/framework/types"
import { ERP_MODULE } from "../modules/erp"

export default async function erpInventoryPullJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const erpService = container.resolve(ERP_MODULE) as any

  const providers = erpService.getAllProviders()

  for (const provider of providers) {
    try {
      const levels = await provider.getInventoryLevels()
      if (levels.length === 0) continue

      logger.info(`Pulled ${levels.length} inventory levels from ${provider.identifier}`)
    } catch (error: any) {
      logger.error(`Inventory pull error [${provider.identifier}]:`, error.message)
    }
  }
}

export const config = {
  name: "erp-inventory-pull",
  schedule: "0 * * * *",
}
