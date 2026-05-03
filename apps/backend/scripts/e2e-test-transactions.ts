import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function e2eTestTransactions({ container }: ExecArgs) {
  const {
    createCartWorkflow,
    updateCartWorkflow,
    completeCartWorkflow,
    createCustomersWorkflow,
    capturePaymentWorkflow,
    addShippingMethodToCartWorkflow,
  } = await import("@medusajs/medusa/core-flows")

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  
  try {
    // 1. Resolve valid IDs
    logger.info("Resolving system IDs...");
    
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "name", "currency_code"],
      filters: { name: "United States" }
    });
    const region = regions[0];
    const region_id = region.id;
    const currency_code = region.currency_code;

    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku"],
      filters: { sku: "CL-BPC-0005" }
    });
    const variant_id = variants[0]?.id;

    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id"],
    });
    const sales_channel_id = salesChannels[0]?.id;

    // Use an existing shipping option
    const { data: shippingOptions } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name"],
      filters: { name: "Standard Shipping" }
    });
    const shipping_option_id = shippingOptions[0]?.id;

    if (!region_id || !variant_id || !sales_channel_id || !shipping_option_id) {
      throw new Error(`Could not resolve all required IDs: region=${region_id}, variant=${variant_id}, sc=${sales_channel_id}, shipping=${shipping_option_id}`);
    }

    const email = `test-customer-${Date.now()}@example.com`;
    logger.info(`Starting E2E Test Transaction for ${email}...`);

    // 2. Create Customer
    logger.info("Step 1: Creating customer...");
    const { result: customers } = await createCustomersWorkflow(container).run({
      input: {
        customersData: [{
          email,
          first_name: "Test",
          last_name: "E2E User",
        }]
      }
    });
    const customer = customers[0];
    logger.info(`Customer created: ${customer.id}`);

    // 3. Create Cart
    logger.info("Step 2: Creating cart...");
    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id,
        sales_channel_id,
        email,
        items: [{ variant_id, quantity: 1 }],
      }
    });
    logger.info(`Cart created: ${cart.id}`);

    // 4. Set Address
    logger.info("Step 3: Setting addresses...");
    await updateCartWorkflow(container).run({
      input: {
        id: cart.id,
        shipping_address: {
          first_name: "Test",
          last_name: "E2E User",
          address_1: "123 Test St",
          city: "New York",
          country_code: "us",
          province: "NY",
          postal_code: "10001",
          phone: "5551234567"
        },
        billing_address: {
          first_name: "Test",
          last_name: "E2E User",
          address_1: "123 Test St",
          city: "New York",
          country_code: "us",
          province: "NY",
          postal_code: "10001",
        }
      }
    });

    // 5. Set Shipping Method
    logger.info(`Step 4: Adding shipping method ${shipping_option_id}...`);
    await addShippingMethodToCartWorkflow(container).run({
      input: {
        cart_id: cart.id,
        options: [{ option_id: shipping_option_id }]
      }
    });

    // 6. Authorize Payment (NMI ACH Sandbox)
    logger.info("Step 5: Authorizing payment (NMI ACH Sandbox)...");
    const { result: completeResult } = await completeCartWorkflow(container).run({
      input: {
        id: cart.id,
        payment_collection: {
          payment_sessions: [
            {
              provider_id: "nmi-ach",
              data: {
                // Sandbox test details for NMI
                checkname: "Test User",
                checkaba: "123456789",
                checkaccount: "987654321",
                account_type: "checking",
                amount: "1.00", 
                currency_code
              }
            }
          ]
        }
      }
    });
    const order = completeResult;
    logger.info(`Order placed: ${order.id}`);

    // 7. Capture Payment (Settlement)
    const paymentCollectionId = order.payment_collections[0].id;
    const { data: payments } = await query.graph({
      entity: "payment",
      fields: ["id", "amount"],
      filters: { payment_collection_id: paymentCollectionId }
    });

    if (payments.length > 0) {
      logger.info(`Step 6: Capturing payment ${payments[0].id}...`);
      await capturePaymentWorkflow(container).run({
        input: {
          payment_id: payments[0].id,
          amount: payments[0].amount
        }
      });
      logger.info("Payment captured.");
    }

    logger.info("E2E Test Transaction complete!");
    logger.info(`Order ID: ${order.id}`);
    
  } catch (error: any) {
    logger.error(`E2E Test Failed: ${error.message}`);
    if (error.stack) logger.error(error.stack);
  }
}
