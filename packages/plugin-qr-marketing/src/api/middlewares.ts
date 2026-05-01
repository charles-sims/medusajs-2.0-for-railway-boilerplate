import { defineMiddlewares } from "@medusajs/framework/http"
import { z } from "zod"

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
  routes: [],
})
