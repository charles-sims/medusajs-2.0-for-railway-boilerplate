import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { isUsStateAllowed, normalizeUsStateCode } from "../lib/ruo"
import { notifyGeoBypass } from "../lib/ruo-alert"

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
    const state = normalizeUsStateCode(province ?? "")
    logger.error(
      `[RUO geo] event=ruo.geo.audit_violation order=${order.id} state=${state} country=${countryCode ?? "?"} — frontend gate bypassed`
    )
    await notifyGeoBypass(
      { orderId: order.id, state, countryCode },
      logger
    )
    return
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
