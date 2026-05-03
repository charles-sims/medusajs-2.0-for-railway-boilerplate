import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function listProviders({ container }: ExecArgs) {
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const providers = await fulfillmentModuleService.listFulfillmentProviders();
  console.log(JSON.stringify(providers, null, 2));
}
