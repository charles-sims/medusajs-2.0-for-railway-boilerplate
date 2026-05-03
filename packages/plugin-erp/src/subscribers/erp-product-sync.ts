import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { syncProductToErpWorkflow } from "../workflows/sync-product-to-erp"

export default async function erpProductSyncHandler({
  event: { data, name },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    await syncProductToErpWorkflow(container).run({
      input: { product_id: data.id, event_name: name },
    })
  } catch (error) {
    console.error(`ERP product sync error [${name}]:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
