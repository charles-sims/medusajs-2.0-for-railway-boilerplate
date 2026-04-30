import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { markInvoicesStaleWorkflow } from "../workflows/mark-invoices-stale"

export default async function orderUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id?: string; order_id?: string }>) {
  const orderId = data.id || data.order_id
  if (!orderId) return

  try {
    await markInvoicesStaleWorkflow(container).run({
      input: { order_id: orderId },
    })
  } catch (error) {
    console.error(`Failed to mark invoices stale for order ${orderId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.updated",
    "order-edit.confirmed",
    "order.exchange_created",
    "order.claim_created",
    "order.return_received",
  ],
}
