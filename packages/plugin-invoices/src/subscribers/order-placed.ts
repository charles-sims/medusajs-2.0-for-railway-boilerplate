import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { generateInvoicePdfWorkflow } from "../workflows/generate-invoice-pdf"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "email", "display_id"],
    filters: { id: data.id },
  })

  const order = orders[0]
  if (!order?.email) return

  const { result } = await generateInvoicePdfWorkflow(container).run({
    input: { order_id: order.id },
  })

  if (!result?.pdf_buffer) return

  const pdfBinary =
    typeof result.pdf_buffer === "string"
      ? result.pdf_buffer
      : Buffer.from(result.pdf_buffer).toString("binary")

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-placed",
      data: {
        emailOptions: {
          subject: `Invoice for order #${order.display_id}`,
          replyTo: "hello@calilean.com",
        },
        order,
      },
      attachments: [
        {
          filename: `invoice-${order.display_id}.pdf`,
          content: pdfBinary,
          content_type: "application/pdf",
        },
      ],
    })
  } catch (error) {
    console.error(`Failed to send invoice email for order ${order.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
