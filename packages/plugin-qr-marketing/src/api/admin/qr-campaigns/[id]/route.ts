import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { QR_MARKETING_MODULE } from "../../../../modules/qr-marketing"
import QrMarketingModuleService from "../../../../modules/qr-marketing/service"
import { PostQrCampaignUpdateSchemaType } from "../../../middlewares"
import QRCode from "qrcode"

const STOREFRONT_URL = process.env.STOREFRONT_URL || "https://calilean.com"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [qr_campaign] } = await query.graph({
    entity: "qr_campaign",
    filters: { id },
    ...req.queryConfig,
  })

  if (!qr_campaign) {
    res.status(404).json({ message: "Campaign not found" })
    return
  }

  const qrUrl = `${STOREFRONT_URL}/go/${qr_campaign.code}`
  const qr_data_url = await QRCode.toDataURL(qrUrl, {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  })

  res.json({ qr_campaign, qr_data_url, qr_url: qrUrl })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<PostQrCampaignUpdateSchemaType>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  const qr_campaign = await service.updateQrCampaigns({
    id,
    ...req.validatedBody,
  })

  res.json({ qr_campaign })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const service: QrMarketingModuleService = req.scope.resolve(QR_MARKETING_MODULE)

  await service.deleteQrCampaigns(id)

  res.json({ id, object: "qr_campaign", deleted: true })
}
