import { InjectManager, MedusaService, MedusaContext } from "@medusajs/framework/utils"
import QrCampaign from "./models/qr-campaign"
import { Context } from "@medusajs/framework/types"
import { EntityManager } from "@medusajs/framework/mikro-orm/knex"

class QrMarketingModuleService extends MedusaService({
  QrCampaign,
}) {
  @InjectManager()
  async incrementScanCount(
    code: string,
    @MedusaContext() sharedContext?: Context<EntityManager>
  ): Promise<void> {
    await sharedContext?.manager?.execute(
      `UPDATE qr_campaign SET scan_count = scan_count + 1 WHERE code = ?`,
      [code]
    )
  }
}

export default QrMarketingModuleService
