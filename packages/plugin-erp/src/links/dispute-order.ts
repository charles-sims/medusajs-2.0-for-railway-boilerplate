import { defineLink } from "@medusajs/framework/utils"
import DisputeModule from "../modules/dispute"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(
  DisputeModule.linkable.dispute,
  OrderModule.linkable.order
)
