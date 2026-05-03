import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function e2eTestTransactions({ container }: ExecArgs) {
  const {
    createCartWorkflow,
    updateCartWorkflow,
    completeCartWorkflow,
    createCustomersWorkflow,
    addShippingMethodToCartWorkflow,
  } = await import("@medusajs/medusa/core-flows")

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  
  try {
    logger.info("Resolving system IDs...");
    
    // Get Region
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: { name: "United States" }
    });
    const region = regions[0];
    const region_id = region.id;
    const currency_code = region.currency_code;

    // Get Variant
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id"],
      filters: { sku: "CL-BPC-0005" }
    });
    const variant_id = variants[0]?.id;

    // Get Sales Channel
    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id"],
    });
    const sales_channel_id = salesChannels[0]?.id;

    const email = `test-e2e-${Date.now()}@example.com`;
    logger.info(`Starting E2E for ${email}...`);

    // 1. Create Customer
    logger.info("Step 1: Creating customer...");
    const { result: customers } = await createCustomersWorkflow(container).run({
      input: {
        customersData: [{ email, first_name: "Test", last_name: "User" }]
      }
    });
    const customer_id = customers[0].id;

    // 2. Create Cart
    logger.info("Step 2: Creating cart...");
    const { result: cart } = await createCartWorkflow(container).run({
      input: { region_id, sales_channel_id, email, items: [{ variant_id, quantity: 1 }] }
    });

    // 3. Set Address
    logger.info("Step 3: Setting address...");
    await updateCartWorkflow(container).run({
      input: {
        id: cart.id,
        shipping_address: {
          first_name: "Test", last_name: "User", address_1: "123 Test St", 
          city: "New York", country_code: "us", province: "NY", postal_code: "10001", phone: "5551234567"
        }
      }
    });

    // 4. Find valid shipping option
    logger.info("Step 4: Finding shipping option...");
    const { data: options } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name"],
      filters: { name: "Standard Shipping" }
    });
    const shipping_option_id = options[0]?.id;
    logger.info(`Using shipping option: ${options[0]?.name} (${shipping_option_id})`);

    // 5. Add Shipping Method
    logger.info("Step 5: Adding shipping method...");
    await addShippingMethodToCartWorkflow(container).run({
      input: { cart_id: cart.id, options: [{ option_id: shipping_option_id }] }
    });

    // 6. Complete Cart with Payment (NMI ACH Sandbox)
    logger.info("Step 6: Completing cart...");
    const { result: order } = await completeCartWorkflow(container).run({
      input: {
        id: cart.id,
        payment_collection: {
          payment_sessions: [{
            provider_id: "pp_nmi-ach_nmi-ach",
            data: {
              checkname: "Test User",
              checkaba: "123456789",
              checkaccount: "987654321",
              account_type: "checking"
            }
          }]
        }
      }
    });

    logger.info(`E2E Success! Order created: ${order.id}`);

  } catch (error: any) {
    logger.error(`E2E Error: ${error.message}`);
    if (error.stack) logger.error(error.stack);
  }
}
