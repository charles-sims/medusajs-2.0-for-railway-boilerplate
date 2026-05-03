import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function getIds({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  });
  
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "variants.id", "variants.sku"],
    filters: { status: "published" }
  });
  
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "price_type"],
  });

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });

  console.log(JSON.stringify({
    regions,
    products: products.slice(0, 5),
    shippingOptions,
    salesChannels
  }, null, 2));
}
