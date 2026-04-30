import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type StepInput = {
  carts: any[]
}

export const sendAbandonedNotificationsStep = createStep(
  "send-abandoned-notifications",
  async ({ carts }: StepInput, { container }) => {
    const notificationModuleService = container.resolve(Modules.NOTIFICATION)

    const notifications = carts.map((cart) => ({
      to: cart.email,
      channel: "email" as const,
      template: "abandoned-cart",
      data: {
        emailOptions: {
          subject: "You left something behind",
          replyTo: "hello@calilean.com",
        },
        customer_name: cart.customer?.first_name || "",
        cart_id: cart.id,
        items: (cart.items || []).map((item: any) => ({
          title: item.variant?.product?.title || item.title,
          variant_title: item.variant?.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          thumbnail: item.variant?.product?.thumbnail || item.thumbnail,
        })),
      },
    }))

    const created = await notificationModuleService.createNotifications(
      notifications
    )

    return new StepResponse(created)
  }
)
