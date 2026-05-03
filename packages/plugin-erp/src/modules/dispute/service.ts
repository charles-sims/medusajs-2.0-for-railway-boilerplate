import { MedusaService } from "@medusajs/framework/utils"
import Dispute from "./models/dispute"

class DisputeModuleService extends MedusaService({
  Dispute,
}) {}

export default DisputeModuleService
