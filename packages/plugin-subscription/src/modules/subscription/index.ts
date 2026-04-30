import { Module } from "@medusajs/framework/utils"
import type { ModuleExports } from "@medusajs/framework/types"
import SubscriptionModuleService from "./service"

export const SUBSCRIPTION_MODULE = "subscriptionModuleService"

const moduleExport: ModuleExports = Module(SUBSCRIPTION_MODULE, {
  service: SubscriptionModuleService
})
export default moduleExport