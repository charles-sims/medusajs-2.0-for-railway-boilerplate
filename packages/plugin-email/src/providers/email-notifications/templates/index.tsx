import { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MedusaError } from '@medusajs/framework/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import { PasswordResetTemplate, PASSWORD_RESET, isPasswordResetData } from './password-reset'
import { ShippingConfirmationTemplate, SHIPPING_CONFIRMATION, isShippingConfirmationData } from './shipping-confirmation'
import { RefundConfirmationTemplate, REFUND_CONFIRMATION, isRefundConfirmationData } from './refund-confirmation'
import { AbandonedCartTemplate, ABANDONED_CART, isAbandonedCartData } from './abandoned-cart'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  PASSWORD_RESET,
  SHIPPING_CONFIRMATION,
  REFUND_CONFIRMATION,
  ABANDONED_CART,
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

/**
 * Generate an email template and return it as an HTML string.
 *
 * We render to HTML here (same module that creates the JSX) so that
 * React element creation and renderToStaticMarkup use the exact same
 * copy of React — avoiding the dual-React mismatch that occurs when
 * the plugin is compiled against React 18 but the host runs React 19.
 */
export function generateEmailTemplate(templateKey: string, data: unknown): string {
  let element: ReactNode

  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      element = <InviteUserEmail {...data} />
      break

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      element = <OrderPlacedTemplate {...data} />
      break

    case EmailTemplates.PASSWORD_RESET:
      if (!isPasswordResetData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.PASSWORD_RESET}"`
        )
      }
      element = <PasswordResetTemplate {...data} />
      break

    case EmailTemplates.SHIPPING_CONFIRMATION:
      if (!isShippingConfirmationData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.SHIPPING_CONFIRMATION}"`
        )
      }
      element = <ShippingConfirmationTemplate {...data} />
      break

    case EmailTemplates.REFUND_CONFIRMATION:
      if (!isRefundConfirmationData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.REFUND_CONFIRMATION}"`
        )
      }
      element = <RefundConfirmationTemplate {...data} />
      break

    case EmailTemplates.ABANDONED_CART:
      if (!isAbandonedCartData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ABANDONED_CART}"`
        )
      }
      element = <AbandonedCartTemplate {...data} />
      break

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }

  return '<!DOCTYPE html>' + renderToStaticMarkup(element as React.ReactElement)
}

export { InviteUserEmail, OrderPlacedTemplate, PasswordResetTemplate, ShippingConfirmationTemplate, RefundConfirmationTemplate, AbandonedCartTemplate }
