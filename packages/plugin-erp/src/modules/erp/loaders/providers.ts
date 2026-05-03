import ErpModuleService from "../service"
import { QboErpProviderService } from "../../../providers/quickbooks"
import { ErpNextProviderService } from "../../../providers/erpnext"

export default async function erpProvidersLoader({
  container,
}: any) {
  const erpService: ErpModuleService = container.resolve("erp")

  // Register QuickBooks Provider
  if (process.env.QBO_CLIENT_ID) {
    erpService.registerProvider(
      new QboErpProviderService(container as any, {
        client_id: process.env.QBO_CLIENT_ID,
        client_secret: process.env.QBO_CLIENT_SECRET!,
        redirect_uri: process.env.QBO_REDIRECT_URI!,
        environment: (process.env.QBO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
      })
    )
  }

  // Register ERPNext Provider
  if (process.env.ERPNEXT_API_URL) {
    erpService.registerProvider(
      new ErpNextProviderService(container as any, {
        api_url: process.env.ERPNEXT_API_URL,
        api_key: process.env.ERPNEXT_API_KEY!,
        api_secret: process.env.ERPNEXT_API_SECRET!,
      })
    )
  }
}
