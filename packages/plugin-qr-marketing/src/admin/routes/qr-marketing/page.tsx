import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Target } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  StatusBadge,
  Text,
  Toaster,
  DataTablePaginationState,
  Button,
} from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"
import { sdk } from "../../lib/sdk"

type QrCampaign = {
  id: string
  code: string
  name: string
  destination_url: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content?: string
  scan_count: number
  is_active: boolean
  product_id?: string
  notes?: string
  guest_key?: string | null
  created_at: string
  updated_at: string
}

const columnHelper = createDataTableColumnHelper<QrCampaign>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <a
        href={`/app/qr-marketing/${row.original.id}`}
        className="text-ui-fg-interactive hover:underline"
      >
        {row.original.name}
      </a>
    ),
  }),
  columnHelper.accessor("code", {
    header: "Code",
  }),
  columnHelper.accessor("destination_url", {
    header: "Destination",
  }),
  columnHelper.accessor("utm_medium", {
    header: "Medium",
  }),
  columnHelper.accessor("utm_campaign", {
    header: "Campaign",
  }),
  columnHelper.accessor("scan_count", {
    header: "Scans",
    cell: ({ row }) => (
      <StatusBadge color="blue">{String(row.original.scan_count)}</StatusBadge>
    ),
  }),
  columnHelper.accessor("is_active", {
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge color={row.original.is_active ? "green" : "grey"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </StatusBadge>
    ),
  }),
  columnHelper.display({
    id: "guest_access",
    header: "Guest",
    cell: ({ row }) =>
      row.original.guest_key ? (
        <StatusBadge color="purple">Enabled</StatusBadge>
      ) : null,
  }),
]

const PAGE_SIZE = 20

const QrMarketingPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  })
  const [data, setData] = useState<{
    qr_campaigns: QrCampaign[]
    count: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(() => {
    setIsLoading(true)
    setError(null)
    sdk.client
      .fetch<{ qr_campaigns: QrCampaign[]; count: number }>(
        "/admin/qr-campaigns",
        {
          query: {
            offset: pagination.pageIndex * pagination.pageSize,
            limit: pagination.pageSize,
            order: "-created_at",
          },
        }
      )
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load campaigns")
        setIsLoading(false)
      })
  }, [pagination])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const table = useDataTable({
    columns,
    data: data?.qr_campaigns || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  if (error) {
    return (
      <Container>
        <Heading className="mb-2">QR Campaigns</Heading>
        <Text className="text-ui-fg-error">{error}</Text>
      </Container>
    )
  }

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between">
          <Heading>QR Campaigns</Heading>
          <a href="/app/qr-marketing/create">
            <Button size="small">Create</Button>
          </a>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <Toaster />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "QR Marketing",
  icon: Target,
})

export default QrMarketingPage
