import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncPaymentToErpWorkflow } from "../workflows/sync-payment-to-erp"

export default async function erpPaymentSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncPaymentToErpWorkflow(container).run({
      input: { payment_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP payment sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["payment.captured", "payment.refunded"],
}
