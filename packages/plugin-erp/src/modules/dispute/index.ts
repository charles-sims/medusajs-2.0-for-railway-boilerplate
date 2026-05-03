import { Module } from "@medusajs/framework/utils"
import DisputeModuleService from "./service"

export const DISPUTE_MODULE = "dispute"

export default Module(DISPUTE_MODULE, {
  service: DisputeModuleService,
})
