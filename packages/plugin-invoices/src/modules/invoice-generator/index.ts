import createDefaultConfigLoader from "./loaders/create-default-config"
import InvoiceModuleService from "./service"
import { Module } from "@medusajs/framework/utils"
import type { ModuleExports } from "@medusajs/framework/types"

export const INVOICE_MODULE = "invoiceGenerator"

const moduleExport: ModuleExports = Module(INVOICE_MODULE, {
  service: InvoiceModuleService,
  loaders: [createDefaultConfigLoader]
})
export default moduleExport