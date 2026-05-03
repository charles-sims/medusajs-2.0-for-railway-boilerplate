import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { Container, Heading, Text, StatusBadge, Button, toast } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

const ErpPage = () => {
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/admin/erp/sync-status")
      const data = await response.json()
      setSyncStatus(data)
    } catch (error) {
      console.error("Failed to fetch ERP status", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">ERP Integration</Heading>
        <Button variant="secondary" onClick={fetchStatus} isLoading={isLoading}>
          Refresh Status
        </Button>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <Heading level="h2" className="mb-2">QuickBooks Online</Heading>
            <div className="flex items-center justify-between">
              <StatusBadge color={syncStatus?.quickbooks?.connected ? "green" : "grey"}>
                {syncStatus?.quickbooks?.connected ? "Connected" : "Disconnected"}
              </StatusBadge>
              {!syncStatus?.quickbooks?.connected && (
                <Button size="small" onClick={() => window.location.href = "/admin/erp/connect/quickbooks"}>
                  Connect
                </Button>
              )}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <Heading level="h2" className="mb-2">ERPNext</Heading>
            <div className="flex items-center justify-between">
              <StatusBadge color={syncStatus?.erpnext?.connected ? "green" : "grey"}>
                {syncStatus?.erpnext?.connected ? "Connected" : "Disconnected"}
              </StatusBadge>
              {!syncStatus?.erpnext?.connected && (
                <Text size="small" className="text-ui-fg-subtle italic">
                  Configure via environment variables
                </Text>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Heading level="h2" className="mb-4">Recent Sync Jobs</Heading>
          <Text className="text-ui-fg-subtle">
            Sync functionality is active. Check individual orders for detailed synchronization status.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "ERP",
  icon: Buildings,
})

export default ErpPage
