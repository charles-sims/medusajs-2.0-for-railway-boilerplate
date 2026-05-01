import { Module } from "@medusajs/framework/utils"
import QrMarketingModuleService from "./service"

export const QR_MARKETING_MODULE = "qrMarketing"

export default Module(QR_MARKETING_MODULE, {
  service: QrMarketingModuleService,
})
