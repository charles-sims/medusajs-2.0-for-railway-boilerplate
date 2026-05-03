import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncDisputeToErpWorkflow } from "../workflows/sync-dispute-to-erp"

export default async function erpDisputeSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncDisputeToErpWorkflow(container).run({
      input: { dispute_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP dispute sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["dispute.created", "dispute.won", "dispute.lost"],
}
