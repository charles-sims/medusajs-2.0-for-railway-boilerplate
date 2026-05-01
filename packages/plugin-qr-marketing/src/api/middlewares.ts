import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "zod"

export const GetQrCampaignsSchema = z.object({
  limit: z.preprocess((val) => val && Number(val), z.number().optional()),
  offset: z.preprocess((val) => val && Number(val), z.number().optional()),
  fields: z.string().optional(),
  order: z.string().optional(),
})

export const PostQrCampaignSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1),
  destination_url: z.string().min(1),
  utm_source: z.string().default("qr"),
  utm_medium: z.string().min(1),
  utm_campaign: z.string().min(1),
  utm_content: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  product_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type PostQrCampaignSchemaType = z.infer<typeof PostQrCampaignSchema>

export const PostQrCampaignUpdateSchema = z.object({
  code: z.string().min(1).max(100).optional(),
  name: z.string().min(1).optional(),
  destination_url: z.string().min(1).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().min(1).optional(),
  utm_campaign: z.string().min(1).optional(),
  utm_content: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  product_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type PostQrCampaignUpdateSchemaType = z.infer<typeof PostQrCampaignUpdateSchema>

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/qr-campaigns",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetQrCampaignsSchema, {
          isList: true,
          defaults: [
            "id", "code", "name", "destination_url",
            "utm_source", "utm_medium", "utm_campaign", "utm_content",
            "scan_count", "is_active", "product_id", "notes",
            "created_at", "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/qr-campaigns",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostQrCampaignSchema),
      ],
    },
    {
      matcher: "/admin/qr-campaigns/:id",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetQrCampaignsSchema, {
          isList: false,
          defaults: [
            "id", "code", "name", "destination_url",
            "utm_source", "utm_medium", "utm_campaign", "utm_content",
            "scan_count", "is_active", "product_id", "notes",
            "created_at", "updated_at",
          ],
        }),
      ],
    },
    {
      matcher: "/admin/qr-campaigns/:id",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostQrCampaignUpdateSchema),
      ],
    },
  ],
})
