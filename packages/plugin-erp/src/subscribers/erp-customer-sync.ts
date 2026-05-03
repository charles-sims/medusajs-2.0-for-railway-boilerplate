import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncCustomerToErpWorkflow } from "../workflows/sync-customer-to-erp"

export default async function erpCustomerSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncCustomerToErpWorkflow(container).run({
      input: { customer_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP customer sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["customer.created", "customer.updated", "customer.deleted"],
}
