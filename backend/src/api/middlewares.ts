import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import multer from "multer"

// COA upload
const coaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 25 MB — COA PDFs are normally < 5 MB; chromatogram PDFs can be larger.
    fileSize: 25 * 1024 * 1024,
    files: 1,
  },
})

// Bundled products schemas (lazy imports to avoid circular deps at load time)
import { PostBundledProductsSchema } from "./admin/bundled-products/route"
import { PostCartsBundledLineItemsSchema } from "./store/carts/[id]/line-item-bundles/route"

// Invoice generator schema
import { PostInvoiceConfgSchema } from "./admin/invoice-config/route"

// Preorder schema
import { UpsertPreorderVariantSchema } from "./admin/variants/[id]/preorders/route"

// Product reviews schemas
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route"
import { GetAdminReviewsSchema } from "./admin/reviews/route"

// Subscriptions schema
const GetSubscriptionsSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    // --- COA Upload ---
    {
      method: ["POST"],
      matcher: "/admin/products/:id/coa/files",
      middlewares: [coaUpload.single("file")],
    },

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

    // --- Invoice Generator ---
    {
      matcher: "/admin/invoice-config",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostInvoiceConfgSchema),
      ],
    },

    // --- Preorder ---
    {
      matcher: "/admin/variants/:id/preorders",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(UpsertPreorderVariantSchema),
      ],
    },

    // --- Product Reviews ---
    {
      matcher: "/store/reviews",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    {
      matcher: "/store/products/:id/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreReviewsSchema, {
          isList: true,
          defaults: ["id", "rating", "title", "first_name", "last_name", "content", "created_at"],
        }),
      ],
    },
    {
      matcher: "/admin/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/reviews/status",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema),
      ],
    },

    // --- Subscriptions ---
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
