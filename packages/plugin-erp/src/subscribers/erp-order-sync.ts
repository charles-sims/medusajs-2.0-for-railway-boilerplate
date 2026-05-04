import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncOrderToErpWorkflow } from "../workflows/sync-order-to-erp"

export default async function erpOrderSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncOrderToErpWorkflow(container).run({
      input: { order_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP order sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.canceled", "order.completed", "order.deleted"],
}
