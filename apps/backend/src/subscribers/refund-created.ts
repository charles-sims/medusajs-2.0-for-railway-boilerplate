import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

export default async function refundCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve(Modules.ORDER)
  const notificationService = container.resolve(Modules.NOTIFICATION)

  const order: any = await orderService.retrieveOrder(data.id, {
    relations: ["refunds"],
  })

  if (!order.email) return

  const latestRefund = order.refunds?.[order.refunds.length - 1]

  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template: "refund-confirmation",
    data: {
      order,
      refund_amount: latestRefund?.amount ?? 0,
      currency_code: order.currency_code,
      reason: latestRefund?.reason,
      emailOptions: {
        subject: `Refund processed for CaliLean order #${order.display_id}`,
      },
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.refund_created",
}
