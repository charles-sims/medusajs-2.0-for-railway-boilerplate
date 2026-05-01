import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function handleOrderAttribution({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "total", "metadata"],
    filters: { id: data.id },
  })

  if (!order?.metadata?.attribution) {
    return
  }

  const attribution = order.metadata.attribution as {
    source: string
    medium: string
    campaign: string
    content: string
    campaign_code: string
  }

  try {
    const analyticsService = container.resolve(Modules.ANALYTICS)
    await analyticsService.track({
      event: "order_placed",
      actor_id: order.customer_id || undefined,
      properties: {
        order_id: order.id,
        total: order.total,
        attribution,
      },
    })
  } catch {
    // Analytics module may not be configured
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
