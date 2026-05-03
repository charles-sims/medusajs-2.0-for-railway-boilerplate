import { defineLink } from "@medusajs/framework/utils"
import DisputeModule from "../modules/dispute"
import PaymentModule from "@medusajs/medusa/payment"

export default defineLink(
  DisputeModule.linkable.dispute,
  PaymentModule.linkable.payment
)
