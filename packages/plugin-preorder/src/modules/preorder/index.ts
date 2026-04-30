import PreorderModuleService from "./service"
import { Module } from "@medusajs/framework/utils"
import type { ModuleExports } from "@medusajs/framework/types"

export const PREORDER_MODULE = "preorder"

const moduleExport: ModuleExports = Module(PREORDER_MODULE, {
  service: PreorderModuleService,
})
export default moduleExport