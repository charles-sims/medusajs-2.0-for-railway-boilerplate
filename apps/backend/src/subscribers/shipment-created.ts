import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve(Modules.ORDER)
  const notificationService = container.resolve(Modules.NOTIFICATION)

  const order = await orderService.retrieveOrder(data.id, {
    relations: ["items", "shipping_address", "fulfillments"],
  })

  if (!order.email) return

  const latestFulfillment = order.fulfillments?.[order.fulfillments.length - 1]

  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template: "shipping-confirmation",
    data: {
      order,
      shippingAddress: order.shipping_address,
      tracking_number: latestFulfillment?.tracking_links?.[0]?.number,
      tracking_url: latestFulfillment?.tracking_links?.[0]?.url,
      emailOptions: {
        subject: `Your CaliLean order #${order.display_id} has shipped`,
      },
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
