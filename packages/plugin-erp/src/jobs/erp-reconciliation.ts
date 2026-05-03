import { MedusaContainer } from "@medusajs/framework/types"

export default async function erpReconciliationJob(container: MedusaContainer) {
  const logger = container.resolve("logger")

  logger.info("Starting daily ERP reconciliation...")

  const query = container.resolve("query")

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { data: recentOrders } = await (query as any).graph({
    entity: "order",
    fields: ["id", "display_id", "metadata", "created_at"],
    filters: {
      created_at: { $gte: oneDayAgo.toISOString() },
    },
  })

  const missingSync = recentOrders.filter(
    (order: any) => !order.metadata?.erp_ids
  )

  if (missingSync.length > 0) {
    logger.warn(
      `ERP reconciliation: ${missingSync.length} orders missing ERP sync: ${missingSync.map((o: any) => o.display_id).join(", ")}`
    )
  } else {
    logger.info(`ERP reconciliation: all ${recentOrders.length} recent orders synced`)
  }
}

export const config = {
  name: "erp-reconciliation",
  schedule: "0 0 * * *",
}
