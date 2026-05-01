import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Target } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  StatusBadge,
  Toaster,
  DataTablePaginationState,
  Button,
} from "@medusajs/ui"
import { useMemo, useState, useEffect, useCallback } from "react"
import { sdk } from "../../lib/sdk"
import { Link } from "react-router-dom"

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
  created_at: string
  updated_at: string
}

const columnHelper = createDataTableColumnHelper<QrCampaign>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link to={`/qr-marketing/${row.original.id}`} className="text-ui-fg-interactive hover:underline">
        {row.original.name}
      </Link>
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
]

const limit = 20

const QrMarketingPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  const [data, setData] = useState<{ qr_campaigns: QrCampaign[]; count: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCampaigns = useCallback(() => {
    setIsLoading(true)
    sdk.client
      .fetch<{ qr_campaigns: QrCampaign[]; count: number }>("/admin/qr-campaigns", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
          order: "-created_at",
        },
      })
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
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

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between">
          <Heading>QR Campaigns</Heading>
          <Link to="/qr-marketing/create">
            <Button size="small">Create</Button>
          </Link>
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
