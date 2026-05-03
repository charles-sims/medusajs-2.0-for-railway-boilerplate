import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkRules({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "rules.*"],
    filters: { id: "so_01KQ13QEJ1EKRN34AQVKHRAMRM" }
  });
  console.log(JSON.stringify(data[0], null, 2));
}
