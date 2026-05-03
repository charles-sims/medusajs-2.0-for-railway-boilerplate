import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncOrderToErpWorkflow } from "../../../../workflows/sync-order-to-erp"
import { syncCustomerToErpWorkflow } from "../../../../workflows/sync-customer-to-erp"
import { syncProductToErpWorkflow } from "../../../../workflows/sync-product-to-erp"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { entity, entity_id } = req.body as { entity: string; entity_id: string }

  try {
    if (entity === "order") {
      await syncOrderToErpWorkflow(req.scope).run({
        input: { order_id: entity_id, event_name: "order.placed" },
      })
    } else if (entity === "customer") {
      await syncCustomerToErpWorkflow(req.scope).run({
        input: { customer_id: entity_id, event_name: "customer.created" },
      })
    } else if (entity === "product") {
      await syncProductToErpWorkflow(req.scope).run({
        input: { product_id: entity_id, event_name: "product.created" },
      })
    } else {
      return res.status(400).json({ error: `Unknown entity type: ${entity}` })
    }

    res.json({ success: true, entity, entity_id })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
