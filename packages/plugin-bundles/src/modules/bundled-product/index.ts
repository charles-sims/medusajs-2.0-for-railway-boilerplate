import { Module } from "@medusajs/framework/utils"
import type { ModuleExports } from "@medusajs/framework/types"
import BundledProductsModuleService from "./service"

export const BUNDLED_PRODUCT_MODULE = "bundledProduct"

const moduleExport: ModuleExports = Module(BUNDLED_PRODUCT_MODULE, {
  service: BundledProductsModuleService,
})
export default moduleExport
