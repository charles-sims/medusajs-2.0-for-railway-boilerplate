import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import { SANITY_MODULE } from "../modules/sanity";

// Only register the link when the Sanity module is active
if (process.env.SANITY_API_TOKEN) {
  defineLink(
    {
      linkable: ProductModule.linkable.product.id,
      field: "id",
    },
    {
      linkable: {
        serviceName: SANITY_MODULE,
        alias: "sanity_product",
        primaryKey: "id",
      },
    },
    {
      readOnly: true,
    }
  );
}
