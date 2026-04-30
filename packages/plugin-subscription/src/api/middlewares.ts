import {
  defineMiddlewares,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

const GetSubscriptionsSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/subscriptions",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetSubscriptionsSchema,
          {
            defaults: [
              "id",
              "subscription_date",
              "expiration_date",
              "status",
              "metadata.*",
              "orders.*",
              "customer.*",
            ],
            isList: true,
          }
        ),
      ],
    },
  ],
})
