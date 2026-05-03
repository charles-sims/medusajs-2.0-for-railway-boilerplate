async function e2eApiTest() {
  const baseUrl = "http://localhost:9000/store";
  const publishableKey = "pk_c7c268a4881ad439407762c1bd993850f29ea6309f20349c9a359dfb7fdf3e1f";

  async function call(url: string, method: string = "GET", body?: any, headers: any = {}) {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(`API Error ${response.status} on ${url}: ${JSON.stringify(json)}`);
    }
    return json;
  }

  try {
    console.log("Starting API-based E2E test...");

    // 1. Create Cart
    console.log("Step 1: Creating cart...");
    const { cart: initialCart } = await call("/carts", "POST", {
      region_id: "reg_01KKVY3GMX8YEZ67NR82GHT7SG"
    });
    console.log(`Cart created: ${initialCart.id}`);

    // 2. Add Item
    console.log("Step 2: Adding item...");
    await call(`/carts/${initialCart.id}/line-items`, "POST", {
      variant_id: "variant_01KKVY3H8PK44N968DVJZGKB9P",
      quantity: 1
    });

    // 3. Set Address
    console.log("Step 3: Setting addresses...");
    await call(`/carts/${initialCart.id}`, "POST", {
      email: `api-test-${Date.now()}@example.com`,
      shipping_address: {
        first_name: "API",
        last_name: "Test",
        address_1: "456 API Ave",
        city: "Los Angeles",
        country_code: "us",
        province: "CA",
        postal_code: "90001",
        phone: "5559876543"
      }
    });

    // 4. Get Shipping Options
    console.log("Step 4: Fetching shipping options...");
    const { shipping_options } = await call(`/shipping-options?cart_id=${initialCart.id}`);
    const option = shipping_options.find(o => o.name === "Standard Shipping") || shipping_options[0];
    console.log(`Using shipping option: ${option.name} (${option.id})`);

    // 5. Add Shipping Method
    console.log("Step 5: Adding shipping method...");
    await call(`/carts/${initialCart.id}/shipping-methods`, "POST", {
      option_id: option.id
    });

    // 6. Initialize Payment Collection
    console.log("Step 6: Initializing payment collection...");
    const { payment_collection } = await call(`/payment-collections`, "POST", {
      cart_id: initialCart.id
    });
    console.log(`Payment collection created: ${payment_collection.id}`);

    // 7. Initialize Payment Session (NMI ACH)
    console.log("Step 7: Initializing payment session (NMI ACH)...");
    await call(`/payment-collections/${payment_collection.id}/payment-sessions`, "POST", {
      provider_id: "pp_nmi-ach_nmi-ach",
      data: {
        checkname: "Test User",
        checkaba: "123456789",
        checkaccount: "987654321",
        account_type: "checking",
      }
    });

    // 8. Complete Cart (Place Order)
    console.log("Step 8: Completing cart...");
    // Wait a bit to ensure background tasks from session creation are settled
    await new Promise(r => setTimeout(r, 2000));
    
    const completeResponse = await call(`/carts/${initialCart.id}/complete`, "POST", {}, {
      "Idempotency-Key": `test-${Date.now()}`
    });
    console.log("Cart completion response type:", completeResponse.type);

    if (completeResponse.type === "order") {
      console.log(`API E2E test successful! Order created: ${completeResponse.order.id}`);
      
      // Capture payment
      const paymentId = completeResponse.order.payment_collections[0].payments[0].id;
      console.log(`Step 9: Capturing payment ${paymentId}...`);
      // In Medusa 2.0, capture is usually an admin action, but some providers do it automatically.
      // If we want to simulate manual capture, we need admin auth.
    }
  } catch (error: any) {
    console.error(`API Test Failed: ${error.message}`);
  }
}

e2eApiTest();
