import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ERP_MODULE } from "../../modules/erp"
import { SyncResult } from "../../modules/erp/types"

type SyncInput = {
  action: string
  entity_id: string
  payload: any
}

export const syncToErpProvidersStep = createStep(
  {
    name: "sync-to-erp-providers",
    maxRetries: 3,
  },
  async (input: SyncInput, { container }) => {
    if (!input) return new StepResponse([], null)

    const erpService = container.resolve(ERP_MODULE) as any
    const providers = erpService.getAllProviders()
    const results: SyncResult[] = []
    const errors: { provider_id: string; error: string }[] = []

    for (const provider of providers) {
      try {
        const method = (provider as any)[input.action]
        if (typeof method !== "function") continue
        const externalId = await method.call(provider, ...input.payload)
        if (externalId) {
          results.push({ external_id: externalId, provider_id: provider.identifier })
        }
      } catch (error: any) {
        errors.push({ provider_id: provider.identifier, error: error.message })
        console.error(`ERP sync error [${provider.identifier}] ${input.action}:`, error.message)
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return StepResponse.permanentFailure(
        `All ERP providers failed for ${input.action}: ${errors.map((e) => `${e.provider_id}: ${e.error}`).join("; ")}`,
        { results, errors }
      )
    }

    return new StepResponse(results, { action: input.action, results })
  },
  async (compensationData, { container }) => {
    if (!compensationData?.results) return

    const erpService = container.resolve(ERP_MODULE) as any
    const providers = erpService.getAllProviders()

    for (const result of compensationData.results) {
      const provider = providers.find((p: any) => p.identifier === result.provider_id)
      if (!provider) continue

      try {
        const action = compensationData.action
        if (action === "createSalesReceipt") {
          await provider.voidSalesReceipt(result.external_id)
        } else if (action === "createCustomer") {
          await provider.deactivateCustomer(result.external_id)
        }
      } catch (error: any) {
        console.error(`ERP compensation error [${result.provider_id}]:`, error.message)
      }
    }
  }
)
