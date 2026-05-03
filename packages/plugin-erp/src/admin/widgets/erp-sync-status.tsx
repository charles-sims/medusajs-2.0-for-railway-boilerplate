import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text, StatusBadge, Button, toast } from "@medusajs/ui"
import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const ErpSyncStatusWidget = ({ data: order }: DetailWidgetProps<any>) => {
  const queryClient = useQueryClient()
  const [isSyncing, setIsSyncing] = useState(false)

  const erpIds = useMemo(() => {
    return order.metadata?.erp_ids || {}
  }, [order.metadata])

  const syncStatus = useMemo(() => {
    const providers = ["quickbooks", "erpnext"]
    return providers.map(p => ({
      provider: p,
      id: erpIds[p] || null,
      status: erpIds[p] ? "synced" : "pending"
    }))
  }, [erpIds])

  const resync = useMutation({
    mutationFn: (providerId: string) => {
      // In a real implementation, this would call our /admin/erp/resync route
      // We'll use the Medusa client if available, or fetch
      return fetch(`/admin/erp/resync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity: "order",
          entity_id: order.id,
          provider_id: providerId
        })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", order.id] })
      toast.success("Resync triggered successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to trigger resync")
    },
    onSettled: () => {
      setIsSyncing(false)
    }
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">ERP Synchronization</Heading>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-4">
        {syncStatus.map((s) => (
          <div key={s.provider} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
            <div className="flex flex-col">
              <Text size="small" weight="plus" className="capitalize">
                {s.provider}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {s.id ? `ID: ${s.id}` : "Not synced yet"}
              </Text>
            </div>
            <div className="flex items-center gap-x-2">
              <StatusBadge color={s.status === "synced" ? "green" : "grey"}>
                {s.status}
              </StatusBadge>
              <Button
                variant="secondary"
                size="small"
                isLoading={isSyncing}
                onClick={() => {
                  setIsSyncing(true)
                  resync.mutate(s.provider)
                }}
              >
                Resync
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default ErpSyncStatusWidget
