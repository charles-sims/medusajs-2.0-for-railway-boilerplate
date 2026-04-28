import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { generateInvoicePdfWorkflow } from '../workflows/generate-invoice-pdf'
import { handleOrderPointsWorkflow } from '../workflows/handle-order-points'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)

  // --- Send order confirmation email ---
  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: 'info@example.com',
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress,
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }

  // --- Generate invoice PDF ---
  try {
    await generateInvoicePdfWorkflow(container).run({
      input: { order_id: data.id }
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
  }

  // --- Award loyalty points ---
  try {
    await handleOrderPointsWorkflow(container).run({
      input: { order_id: data.id }
    })
  } catch (error) {
    console.error('Error handling loyalty points:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
