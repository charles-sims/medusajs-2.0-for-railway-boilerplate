import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncOrderToErpWorkflow } from "../workflows/sync-order-to-erp"

export default async function erpOrderChangesSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const orderId = "order_id" in data ? data.order_id : data.id
  try {
    await syncOrderToErpWorkflow(container).run({
      input: { order_id: orderId!, event_name: name },
    })
  } catch (error) {
    console.error(`ERP order changes sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.fulfillment_created",
    "order.fulfillment_canceled",
    "order.return_requested",
    "order.return_received",
    "order.claim_created",
    "order.exchange_created",
    "order-edit.confirmed",
  ],
}
