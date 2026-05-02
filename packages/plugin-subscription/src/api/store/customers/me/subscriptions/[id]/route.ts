import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import SubscriptionModuleService from "../../../../../../modules/subscription/service";
import {
  SUBSCRIPTION_MODULE
} from "../../../../../../modules/subscription";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const subscriptionModuleService: SubscriptionModuleService =
    req.scope.resolve(SUBSCRIPTION_MODULE)

  const { data: [subscription] } = await query.graph({
    entity: "subscription",
    fields: ["id", "customer.id"],
    filters: {
      id: [req.params.id]
    }
  })

  if (!subscription) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Subscription with id ${req.params.id} not found`
    )
  }

  // Verify that the subscription belongs to the authenticated customer
  if (subscription.customer?.id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You do not have permission to cancel this subscription"
    )
  }

  const updatedSubscription = await subscriptionModuleService
    .cancelSubscriptions(
      req.params.id
    )

  res.json({
    subscription: updatedSubscription
  })
}
