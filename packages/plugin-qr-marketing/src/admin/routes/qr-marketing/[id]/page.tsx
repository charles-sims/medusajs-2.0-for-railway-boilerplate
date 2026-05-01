import {
  Container,
  Heading,
  Text,
  Button,
  StatusBadge,
  Switch,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { sdk } from "../../../lib/sdk"

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
}

type DetailResponse = {
  qr_campaign: QrCampaign
  qr_data_url: string
  qr_url: string
}

const QR_CAMPAIGN_QUERY_KEY = "qr-campaign-detail"

const QrCampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: [QR_CAMPAIGN_QUERY_KEY, id],
    queryFn: () =>
      sdk.client.fetch<DetailResponse>(`/admin/qr-campaigns/${id}`),
  })

  const toggleActive = useMutation({
    mutationFn: (newStatus: boolean) =>
      sdk.client.fetch<{ qr_campaign: QrCampaign }>(
        `/admin/qr-campaigns/${id}`,
        { method: "POST", body: { is_active: newStatus } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QR_CAMPAIGN_QUERY_KEY, id] })
      toast.success(
        data?.qr_campaign.is_active
          ? "Campaign deactivated"
          : "Campaign activated"
      )
    },
    onError: () => toast.error("Failed to update status"),
  })

  const toggleGuestAccess = useMutation({
    mutationFn: (enabling: boolean) =>
      sdk.client.fetch<{ qr_campaign: QrCampaign }>(
        `/admin/qr-campaigns/${id}`,
        { method: "POST", body: { enable_guest_access: enabling } }
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QR_CAMPAIGN_QUERY_KEY, id] })
      toast.success(
        res.qr_campaign.guest_key
          ? "Guest access enabled"
          : "Guest access disabled"
      )
    },
    onError: () => toast.error("Failed to update guest access"),
  })

  const deleteCampaign = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/qr-campaigns/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Campaign deleted")
      window.location.href = "/app/qr-marketing"
    },
    onError: () => toast.error("Failed to delete campaign"),
  })

  const handleDownloadQR = () => {
    if (!data?.qr_data_url) return
    const link = document.createElement("a")
    link.download = `qr-${data.qr_campaign.code}.png`
    link.href = data.qr_data_url
    link.click()
  }

  if (isLoading) {
    return (
      <Container>
        <Text>Loading campaign...</Text>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container>
        <Heading className="mb-2">Campaign not found</Heading>
        <Text className="text-ui-fg-subtle">
          Could not load campaign {id}.
        </Text>
        {error && (
          <Text size="small" className="text-ui-fg-error mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
        )}
        <Button
          size="small"
          variant="secondary"
          className="mt-4"
          onClick={() => (window.location.href = "/app/qr-marketing")}
        >
          Back to campaigns
        </Button>
      </Container>
    )
  }

  const { qr_campaign: c, qr_data_url, qr_url } = data

  return (
    <div className="flex flex-col gap-4">
      {/* Campaign Info */}
      <Container>
        <div className="flex items-center justify-between mb-4">
          <Heading>{c.name}</Heading>
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => toggleActive.mutate(!c.is_active)}
              isLoading={toggleActive.isPending}
            >
              {c.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={() => deleteCampaign.mutate()}
              isLoading={deleteCampaign.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              Code
            </Text>
            <Text>{c.code}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              Status
            </Text>
            <StatusBadge color={c.is_active ? "green" : "grey"}>
              {c.is_active ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              Destination
            </Text>
            <Text>{c.destination_url}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              Scans
            </Text>
            <StatusBadge color="blue">{String(c.scan_count)}</StatusBadge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              UTM Medium
            </Text>
            <Text>{c.utm_medium}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              UTM Campaign
            </Text>
            <Text>{c.utm_campaign}</Text>
          </div>
          {c.utm_content && (
            <div>
              <Text size="small" className="text-ui-fg-subtle">
                UTM Content
              </Text>
              <Text>{c.utm_content}</Text>
            </div>
          )}
          {c.notes && (
            <div className="col-span-2">
              <Text size="small" className="text-ui-fg-subtle">
                Notes
              </Text>
              <Text>{c.notes}</Text>
            </div>
          )}
        </div>
      </Container>

      {/* Guest Access */}
      <Container>
        <div className="flex items-center justify-between mb-2">
          <Heading level="h2">Guest Access</Heading>
          <Switch
            checked={!!c.guest_key}
            onCheckedChange={(checked) => toggleGuestAccess.mutate(checked)}
            disabled={toggleGuestAccess.isPending}
          />
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          Allow visitors to browse without creating an account. Checkout still
          requires sign-up.
        </Text>
        {c.guest_key && (
          <div className="mt-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
            <Text size="small" className="text-ui-fg-subtle">
              Guest Key
            </Text>
            <Text className="font-mono text-xs mt-1 break-all">
              {c.guest_key}
            </Text>
          </div>
        )}
      </Container>

      {/* QR Code */}
      <Container>
        <Heading level="h2" className="mb-4">
          QR Code
        </Heading>
        <div className="flex items-start gap-6">
          {qr_data_url ? (
            <img
              src={qr_data_url}
              alt={`QR code for ${c.code}`}
              className="w-48 h-48 border rounded"
            />
          ) : (
            <div className="w-48 h-48 border rounded bg-ui-bg-subtle flex items-center justify-center">
              <Text size="small" className="text-ui-fg-subtle">
                No QR code
              </Text>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Text size="small" className="text-ui-fg-subtle">
              Scan URL
            </Text>
            <Text className="font-mono text-sm">{qr_url}</Text>
            <Button size="small" variant="secondary" onClick={handleDownloadQR}>
              Download PNG
            </Button>
          </div>
        </div>
      </Container>
      <Toaster />
    </div>
  )
}

export default QrCampaignDetailPage
