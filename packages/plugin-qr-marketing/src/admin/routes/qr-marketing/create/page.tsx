import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../../../lib/sdk"

const UTM_MEDIUM_OPTIONS = [
  { value: "packaging", label: "Packaging" },
  { value: "insert", label: "Product Insert" },
  { value: "flyer", label: "Flyer" },
  { value: "event", label: "Event" },
  { value: "display", label: "Display" },
  { value: "other", label: "Other" },
]

const slugify = (text: string) =>
  text.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const CreateQrCampaignPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    code: "",
    destination_url: "",
    utm_medium: "packaging",
    utm_campaign: "",
    utm_content: "",
    notes: "",
  })

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      code: prev.code === slugify(prev.name) || prev.code === "" ? slugify(value) : prev.code,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const body = {
        ...form,
        utm_source: "qr",
        utm_content: form.utm_content || null,
        notes: form.notes || null,
      }
      const res = await sdk.client.fetch<{ qr_campaign: { id: string } }>("/admin/qr-campaigns", {
        method: "POST",
        body,
      })
      toast.success("Campaign created")
      window.location.href = `/app/qr-marketing/${res.qr_campaign.id}`
    } catch {
      toast.error("Failed to create campaign")
      setIsSubmitting(false)
    }
  }

  return (
    <Container>
      <Heading className="mb-6">Create QR Campaign</Heading>
      <div className="flex flex-col gap-4 max-w-lg">
        <div>
          <Label>Name</Label>
          <Input
            placeholder="BPC-157 Pen Insert Q2"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <div>
          <Label>Code</Label>
          <Input
            placeholder="BPC-157-PEN-INSERT-Q2"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          />
        </div>
        <div>
          <Label>Destination URL</Label>
          <Input
            placeholder="/products/bpc-157-pen"
            value={form.destination_url}
            onChange={(e) => setForm((p) => ({ ...p, destination_url: e.target.value }))}
          />
        </div>
        <div>
          <Label>UTM Medium</Label>
          <Select value={form.utm_medium} onValueChange={(v) => setForm((p) => ({ ...p, utm_medium: v }))}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {UTM_MEDIUM_OPTIONS.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div>
          <Label>UTM Campaign</Label>
          <Input
            placeholder="spring2026"
            value={form.utm_campaign}
            onChange={(e) => setForm((p) => ({ ...p, utm_campaign: e.target.value }))}
          />
        </div>
        <div>
          <Label>UTM Content (optional)</Label>
          <Input
            placeholder="variant-a"
            value={form.utm_content}
            onChange={(e) => setForm((p) => ({ ...p, utm_content: e.target.value }))}
          />
        </div>
        <div>
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Internal notes about this campaign..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Create Campaign
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = "/app/qr-marketing"}>
            Cancel
          </Button>
        </div>
      </div>
      <Toaster />
    </Container>
  )
}

export default CreateQrCampaignPage
