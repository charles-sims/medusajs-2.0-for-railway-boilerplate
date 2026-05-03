import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listVariants({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku", "weight", "product.title"],
  })

  logger.info("Current Product Variants:")
  variants.forEach((v: any) => {
    logger.info(`- [${v.sku}] ${v.product.title} (${v.title}): Weight = ${v.weight}`)
  })
}
