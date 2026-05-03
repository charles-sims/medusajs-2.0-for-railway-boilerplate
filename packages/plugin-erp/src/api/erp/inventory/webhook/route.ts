import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")

  try {
    const body = req.body as { items?: { sku: string; quantity: number }[] }

    if (!body.items?.length) {
      return res.status(200).json({ received: true, updated: 0 })
    }

    logger.info(`Inventory webhook received: ${body.items.length} items`)
    res.status(200).json({ received: true, updated: body.items.length })
  } catch (error: any) {
    logger.error("Inventory webhook error:", error)
    res.status(500).json({ error: error.message })
  }
}
