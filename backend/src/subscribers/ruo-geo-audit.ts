import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { isUsStateAllowed, normalizeUsStateCode } from "../lib/ruo"

export default async function ruoGeoAuditHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve("logger")
  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER
  )

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["shipping_address"],
  })

  const province = order.shipping_address?.province ?? null
  const countryCode = order.shipping_address?.country_code ?? null

  if (!isUsStateAllowed(province, countryCode)) {
    logger.error(
      `[RUO geo] order ${order.id} shipped to deny-listed state ${normalizeUsStateCode(province ?? "")} — frontend gate bypassed`
    )
    return
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
