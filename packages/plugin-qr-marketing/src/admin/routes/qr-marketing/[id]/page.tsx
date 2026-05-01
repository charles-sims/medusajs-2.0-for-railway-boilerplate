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
import { useEffect, useState } from "react"
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

const QrCampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<DetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sdk.client
      .fetch<DetailResponse>(`/admin/qr-campaigns/${id}`)
      .then((res) => {
        console.log("QR campaign response:", JSON.stringify(res, null, 2))
        setData(res)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch campaign:", err)
        setError(JSON.stringify(err, Object.getOwnPropertyNames(err || {}), 2) || "Unknown error")
        setIsLoading(false)
      })
  }, [id])

  const handleToggleActive = async () => {
    if (!data) return
    const newStatus = !data.qr_campaign.is_active
    await sdk.client.fetch(`/admin/qr-campaigns/${id}`, {
      method: "POST",
      body: { is_active: newStatus },
    })
    setData({
      ...data,
      qr_campaign: { ...data.qr_campaign, is_active: newStatus },
    })
    toast.success(newStatus ? "Campaign activated" : "Campaign deactivated")
  }

  const handleToggleGuestAccess = async () => {
    if (!data) return
    const enabling = !data.qr_campaign.guest_key
    try {
      const res = await sdk.client.fetch<{ qr_campaign: QrCampaign }>(
        `/admin/qr-campaigns/${id}`,
        {
          method: "POST",
          body: { enable_guest_access: enabling },
        }
      )
      setData({ ...data, qr_campaign: res.qr_campaign })
      toast.success(enabling ? "Guest access enabled" : "Guest access disabled")
    } catch {
      toast.error("Failed to update guest access")
    }
  }

  const handleDelete = async () => {
    await sdk.client.fetch(`/admin/qr-campaigns/${id}`, { method: "DELETE" })
    toast.success("Campaign deleted")
    window.location.href = "/app/qr-marketing"
  }

  const handleDownloadQR = () => {
    if (!data?.qr_data_url) return
    const link = document.createElement("a")
    link.download = `qr-${data.qr_campaign.code}.png`
    link.href = data.qr_data_url
    link.click()
  }

  if (isLoading) return <Container><Text>Loading campaign {id}...</Text></Container>
  if (!data) return (
    <Container>
      <Text>Campaign not found for ID: {id}</Text>
      {error && <Text className="text-ui-fg-error mt-2">Error: {error}</Text>}
      <Text className="text-ui-fg-subtle mt-2 text-xs">Check browser console for full details</Text>
    </Container>
  )

  const { qr_campaign: c, qr_data_url, qr_url } = data

  return (
    <div className="flex flex-col gap-4">
      <Container>
        <div className="flex items-center justify-between mb-4">
          <Heading>{c.name}</Heading>
          <div className="flex gap-2">
            <Button size="small" variant="secondary" onClick={handleToggleActive}>
              {c.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button size="small" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text size="small" className="text-ui-fg-subtle">Code</Text>
            <Text>{c.code}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Status</Text>
            <StatusBadge color={c.is_active ? "green" : "grey"}>
              {c.is_active ? "Active" : "Inactive"}
            </StatusBadge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Destination</Text>
            <Text>{c.destination_url}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">Scans</Text>
            <StatusBadge color="blue">{String(c.scan_count)}</StatusBadge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">UTM Medium</Text>
            <Text>{c.utm_medium}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">UTM Campaign</Text>
            <Text>{c.utm_campaign}</Text>
          </div>
          {c.utm_content && (
            <div>
              <Text size="small" className="text-ui-fg-subtle">UTM Content</Text>
              <Text>{c.utm_content}</Text>
            </div>
          )}
          {c.notes && (
            <div className="col-span-2">
              <Text size="small" className="text-ui-fg-subtle">Notes</Text>
              <Text>{c.notes}</Text>
            </div>
          )}
        </div>
      </Container>

      <Container>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h2">Guest Access</Heading>
          <Switch
            checked={!!c.guest_key}
            onCheckedChange={handleToggleGuestAccess}
          />
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          Allow visitors to browse without creating an account. Checkout still requires sign-up.
        </Text>
        {c.guest_key && (
          <div className="mt-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
            <Text size="small" className="text-ui-fg-subtle">Guest Key</Text>
            <Text className="font-mono text-xs mt-1 break-all">{c.guest_key}</Text>
          </div>
        )}
      </Container>

      <Container>
        <Heading level="h2" className="mb-4">QR Code</Heading>
        <div className="flex items-start gap-6">
          <img src={qr_data_url} alt={`QR code for ${c.code}`} className="w-48 h-48 border rounded" />
          <div className="flex flex-col gap-2">
            <Text size="small" className="text-ui-fg-subtle">Scan URL</Text>
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
