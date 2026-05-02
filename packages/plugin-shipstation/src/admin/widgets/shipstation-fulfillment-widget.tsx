import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text, Button, toast } from "@medusajs/ui"
import { useMemo, useState } from "react"
import { sdk } from "../lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const ShipStationFulfillmentWidget = ({ data: order }: DetailWidgetProps<any>) => {
  const queryClient = useQueryClient()
  const [isVoiding, setIsVoiding] = useState<string | null>(null)

  // Find fulfillments that use the shipstation provider
  const shipstationFulfillments = useMemo(() => {
    return (order.fulfillments || []).filter(
      (f: any) => f.provider_id === "shipstation" && !f.canceled_at
    )
  }, [order.fulfillments])

  const voidLabel = useMutation({
    mutationFn: ({ fulfillmentId, labelId, shipmentId }: { fulfillmentId: string, labelId: string, shipmentId: string }) => {
      // This will call our custom API route
      return sdk.client.fetch(`/admin/shipstation/fulfillments/${fulfillmentId}/void`, {
        method: "POST",
        body: { label_id: labelId, shipment_id: shipmentId }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", order.id] })
      toast.success("ShipStation label voided successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to void ShipStation label")
    },
    onSettled: () => {
      setIsVoiding(null)
    }
  })

  if (shipstationFulfillments.length === 0) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">ShipStation Management</Heading>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-4">
        {shipstationFulfillments.map((f: any) => {
          const shipstationData = f.data || {}
          const label = f.labels?.[0] || {}

          return (
            <div key={f.id} className="flex flex-col gap-y-2 border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Text size="small" weight="plus">
                    Fulfillment {f.id.slice(-4)}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    ShipStation ID: {shipstationData.shipment_id || "N/A"}
                  </Text>
                </div>
                {shipstationData.label_id && (
                  <Button
                    variant="secondary"
                    size="small"
                    isLoading={isVoiding === f.id}
                    onClick={() => {
                      setIsVoiding(f.id)
                      voidLabel.mutate({
                        fulfillmentId: f.id,
                        labelId: shipstationData.label_id,
                        shipmentId: shipstationData.shipment_id
                      })
                    }}
                  >
                    Void Label
                  </Button>
                )}
              </div>
              {label.tracking_number && (
                <div className="flex items-center gap-x-2 mt-1">
                  <Text size="small" className="text-ui-fg-subtle">
                    Tracking:
                  </Text>
                  <Text size="small" weight="plus">
                    {label.tracking_number}
                  </Text>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default ShipStationFulfillmentWidget
