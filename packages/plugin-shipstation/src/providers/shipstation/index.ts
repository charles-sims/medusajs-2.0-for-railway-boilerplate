import ShipStationProviderService from "./service"
import {
  ModuleProvider,
  Modules
} from "@medusajs/framework/utils"
import type { ModuleProviderExports } from "@medusajs/framework/types"

const providerExport: ModuleProviderExports = ModuleProvider(Modules.FULFILLMENT, {
  services: [ShipStationProviderService],
})
export default providerExport
