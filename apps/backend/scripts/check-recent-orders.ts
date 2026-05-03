import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function checkRecentOrders({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "email", "status", "created_at"],
    filters: { email: { "$like": "api-test-%" } }
  });
  console.log(JSON.stringify(orders, null, 2));
}
