import { Module } from "@medusajs/framework/utils"
import type { ModuleExports } from "@medusajs/framework/types"
import LoyaltyModuleService from "./service"

export const LOYALTY_MODULE = "loyalty"

const moduleExport: ModuleExports = Module(LOYALTY_MODULE, {
  service: LoyaltyModuleService,
})
export default moduleExport
