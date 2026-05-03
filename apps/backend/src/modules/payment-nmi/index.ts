import NmiAchPaymentProviderService from "./service"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

export default ModuleProvider(Modules.PAYMENT, {
  services: [NmiAchPaymentProviderService],
})
