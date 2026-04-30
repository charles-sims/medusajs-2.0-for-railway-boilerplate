import { Module } from "@medusajs/framework/utils"
import type { ModuleExports } from "@medusajs/framework/types"
import ProductReviewModuleService from "./service"

export const PRODUCT_REVIEW_MODULE = "productReview"

const moduleExport: ModuleExports = Module(PRODUCT_REVIEW_MODULE, {
  service: ProductReviewModuleService,
})
export default moduleExport
