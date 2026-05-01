import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QR_MARKETING_MODULE } from "../../../modules/qr-marketing"
import QrMarketingModuleService from "../../../modules/qr-marketing/service"
import { PostQrCampaignSchemaType } from "../../middlewares"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")

  const {
    data: qr_campaigns,
    metadata: { count, take, skip } = { count: 0, take: 20, skip: 0 },
  } = await query.graph({
    entity: "qr_campaign",
    ...req.queryConfig,
  })

  res.json({
    qr_campaigns,
    count,
    limit: take,
    offset: skip,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostQrCampaignSchemaType>,
  res: MedusaResponse
) => {
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  const qr_campaign = await service.createQrCampaigns(req.validatedBody)

  res.status(201).json({ qr_campaign })
}
