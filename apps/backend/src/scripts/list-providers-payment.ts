import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function listPaymentProviders({ container }: ExecArgs) {
  const paymentModuleService = container.resolve(Modules.PAYMENT);
  const providers = await paymentModuleService.listPaymentProviders();
  console.log(JSON.stringify(providers, null, 2));
}
