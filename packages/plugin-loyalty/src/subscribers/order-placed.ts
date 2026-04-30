import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { handleOrderPointsWorkflow } from "../workflows/handle-order-points"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await handleOrderPointsWorkflow(container).run({
      input: { order_id: data.id },
    })
  } catch (error) {
    console.error(`Failed to handle loyalty points for order ${data.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
