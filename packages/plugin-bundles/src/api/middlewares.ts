import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { PostBundledProductsSchema } from "./admin/bundled-products/route"
import { PostCartsBundledLineItemsSchema } from "./store/carts/[id]/line-item-bundles/route"

export default defineMiddlewares({
  routes: [
    // --- Bundled Products ---
    {
      matcher: "/admin/bundled-products",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostBundledProductsSchema),
      ],
    },
    {
      matcher: "/admin/bundled-products",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "id",
            "title",
            "product.*",
            "items.*",
            "items.product.*",
          ],
          isList: true,
          defaultLimit: 15,
        }),
      ],
    },
    {
      matcher: "/store/carts/:id/line-item-bundles",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostCartsBundledLineItemsSchema),
      ],
    },
  ],
})
