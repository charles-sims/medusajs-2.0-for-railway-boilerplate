import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  CartWorkflowDTO,
  PaymentCollectionDTO,
  IOrderModuleService,
  LinkDefinition
} from "@medusajs/framework/types"
import {
  Modules
} from "@medusajs/framework/utils"
import { createOrderWorkflow } from "@medusajs/medusa/core-flows"
import { SubscriptionData } from "../../../modules/subscription/types"
import { SUBSCRIPTION_MODULE } from "../../../modules/subscription"

export type CreateSubscriptionOrderStepInput = {
  subscription: SubscriptionData
  cart: CartWorkflowDTO
  payment_collection: PaymentCollectionDTO
}

function getOrderData (cart: CartWorkflowDTO) {
  return {
    region_id: cart.region_id,
    customer_id: cart.customer_id,
    sales_channel_id: cart.sales_channel_id,
    email: cart.email,
    currency_code: cart.currency_code,
    shipping_address: cart.shipping_address ? {
      first_name: cart.shipping_address.first_name,
      last_name: cart.shipping_address.last_name,
      address_1: cart.shipping_address.address_1,
      address_2: cart.shipping_address.address_2,
      city: cart.shipping_address.city,
      country_code: cart.shipping_address.country_code,
      province: cart.shipping_address.province,
      postal_code: cart.shipping_address.postal_code,
      phone: cart.shipping_address.phone,
      company: cart.shipping_address.company,
      metadata: cart.shipping_address.metadata
    } : undefined,
    billing_address: cart.billing_address ? {
      first_name: cart.billing_address.first_name,
      last_name: cart.billing_address.last_name,
      address_1: cart.billing_address.address_1,
      address_2: cart.billing_address.address_2,
      city: cart.billing_address.city,
      country_code: cart.billing_address.country_code,
      province: cart.billing_address.province,
      postal_code: cart.billing_address.postal_code,
      phone: cart.billing_address.phone,
      company: cart.billing_address.company,
      metadata: cart.billing_address.metadata
    } : undefined,
    items: cart.items?.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      variant_id: item.variant_id,
      unit_price: item.unit_price,
      metadata: item.metadata
    })),
    shipping_methods: cart.shipping_methods?.map((method) => ({
      name: method.name,
      amount: method.amount,
      is_tax_inclusive: method.is_tax_inclusive,
      shipping_option_id: method.shipping_option_id,
      data: method.data,
      tax_lines: method.tax_lines?.map((taxLine) => ({
        description: taxLine.description,
        tax_rate_id: taxLine.tax_rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id
      })),
      adjustments: method.adjustments?.map((adjustment) => ({
        code: adjustment.code,
        amount: adjustment.amount,
        description: adjustment.description,
        promotion_id: adjustment.promotion_id,
        provider_id: adjustment.provider_id
      }))
    })),
  }
}

const createSubscriptionOrderStep = createStep(
  "create-subscription-order",
  async ({
    subscription, cart, payment_collection
  }: CreateSubscriptionOrderStepInput, { container, context }) => {
    const linkDefs: LinkDefinition[] = []

    const { result: order } = await createOrderWorkflow(container)
      .run({
        input: getOrderData(cart),
        context
      })

    linkDefs.push({
      [Modules.ORDER]: {
        order_id: order.id
      },
      [Modules.PAYMENT]: {
        payment_collection_id: payment_collection.id
      }
    },
    {
      [SUBSCRIPTION_MODULE]: {
        subscription_id: subscription.id
      },
      [Modules.ORDER]: {
        order_id: order.id
      }
    })

    return new StepResponse({
      order,
      linkDefs
    }, {
      order
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const orderModuleService: IOrderModuleService = container.resolve(
      Modules.ORDER
    )

    await orderModuleService.cancel(data.order.id)
  }
)

export default createSubscriptionOrderStep
