import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
      matcher: "/erp/**",
    },
  ],
})
