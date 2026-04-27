import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, HttpTypes } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Container,
  Drawer,
  DropdownMenu,
  Heading,
  IconButton,
  Input,
  Label,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { EllipsisHorizontal } from "@medusajs/icons"
import { useMemo, useState } from "react"

type CoaFileKind = "standard_coa" | "extended_coa" | "chromatogram"

type CoaBatch = {
  hplc_purity_pct?: string
  lcms_identity?: { confirmed?: boolean; method_ref?: string }
  endotoxin_eu_per_mg?: string
  ref_standard_match_pct?: string
  files?: {
    standard_coa_pdf?: string
    extended_coa_pdf?: string
    chromatogram?: string
  }
  issued_at?: string
}

type CoaPanel = {
  tier: string
  current_batch_id: string | null
  batches: Record<string, CoaBatch>
}

const BATCH_ID_RE = /^[A-Z0-9-]+$/

function readPanel(metadata: Record<string, unknown> | null | undefined): {
  panel: CoaPanel | null
  legacyTier: string | null
} {
  const raw = metadata?.coa_panel
  if (typeof raw === "string") {
    return { panel: null, legacyTier: raw }
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Partial<CoaPanel>
    return {
      panel: {
        tier: typeof obj.tier === "string" ? obj.tier : "standard",
        current_batch_id:
          typeof obj.current_batch_id === "string"
            ? obj.current_batch_id
            : null,
        batches:
          obj.batches && typeof obj.batches === "object"
            ? (obj.batches as Record<string, CoaBatch>)
            : {},
      },
      legacyTier: null,
    }
  }
  return { panel: null, legacyTier: null }
}

function fileCount(batch: CoaBatch): number {
  if (!batch.files) return 0
  return Object.values(batch.files).filter(Boolean).length
}

async function uploadCoaFile(
  productId: string,
  batchId: string,
  fileKind: CoaFileKind,
  file: File
): Promise<{ files_field: string; url: string }> {
  const form = new FormData()
  form.append("file", file)
  form.append("batch_id", batchId)
  form.append("file_kind", fileKind)
  const res = await fetch(`/admin/products/${productId}/coa/files`, {
    method: "POST",
    credentials: "include",
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string })
    throw new Error(body.message || `Upload failed (${res.status})`)
  }
  return (await res.json()) as { files_field: string; url: string }
}

async function patchCoaPanel(
  productId: string,
  payload: Record<string, unknown>
): Promise<CoaPanel> {
  const res = await fetch(`/admin/products/${productId}/coa`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string })
    throw new Error(body.message || `Update failed (${res.status})`)
  }
  const data = (await res.json()) as { coa_panel: CoaPanel }
  return data.coa_panel
}

async function deleteCoaBatch(
  productId: string,
  batchId: string
): Promise<CoaPanel> {
  const res = await fetch(
    `/admin/products/${productId}/coa?batch_id=${encodeURIComponent(batchId)}`,
    { method: "DELETE", credentials: "include" }
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string })
    throw new Error(body.message || `Delete failed (${res.status})`)
  }
  const data = (await res.json()) as { coa_panel: CoaPanel }
  return data.coa_panel
}

type BatchFormState = {
  batchId: string
  hplcPurity: string
  lcmsConfirmed: boolean
  lcmsMethodRef: string
  endotoxin: string
  refStandardMatch: string
  setCurrent: boolean
  standardCoa: File | null
  extendedCoa: File | null
  chromatogram: File | null
}

type FormMode = { kind: "new" } | { kind: "edit"; originalBatchId: string }

const EMPTY_FORM: BatchFormState = {
  batchId: "",
  hplcPurity: "",
  lcmsConfirmed: false,
  lcmsMethodRef: "",
  endotoxin: "",
  refStandardMatch: "",
  setCurrent: true,
  standardCoa: null,
  extendedCoa: null,
  chromatogram: null,
}

function formFromBatch(batchId: string, batch: CoaBatch): BatchFormState {
  return {
    batchId,
    hplcPurity: batch.hplc_purity_pct ?? "",
    lcmsConfirmed: batch.lcms_identity?.confirmed ?? false,
    lcmsMethodRef: batch.lcms_identity?.method_ref ?? "",
    endotoxin: batch.endotoxin_eu_per_mg ?? "",
    refStandardMatch: batch.ref_standard_match_pct ?? "",
    setCurrent: false,
    standardCoa: null,
    extendedCoa: null,
    chromatogram: null,
  }
}

const CoaPanelWidget = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const initial = useMemo(() => readPanel(product.metadata), [product.metadata])
  const [panel, setPanel] = useState<CoaPanel | null>(initial.panel)
  const [legacyTier, setLegacyTier] = useState<string | null>(initial.legacyTier)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<BatchFormState>(EMPTY_FORM)
  const [formMode, setFormMode] = useState<FormMode>({ kind: "new" })
  const [submitting, setSubmitting] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [rowBusy, setRowBusy] = useState<string | null>(null)

  const batches = panel?.batches ?? {}
  const sortedBatchIds = Object.keys(batches).sort((a, b) => {
    if (panel?.current_batch_id === a) return -1
    if (panel?.current_batch_id === b) return 1
    const aIssued = batches[a]?.issued_at ?? ""
    const bIssued = batches[b]?.issued_at ?? ""
    return bIssued.localeCompare(aIssued)
  })

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setFormMode({ kind: "new" })
  }

  const openNewBatchDrawer = () => {
    resetForm()
    setDrawerOpen(true)
  }

  const openEditDrawer = (batchId: string) => {
    const batch = panel?.batches[batchId]
    if (!batch) return
    setForm(formFromBatch(batchId, batch))
    setFormMode({ kind: "edit", originalBatchId: batchId })
    setDrawerOpen(true)
  }

  const handleSetCurrent = async (batchId: string) => {
    setRowBusy(batchId)
    try {
      const next = await patchCoaPanel(product.id, {
        batch_id: batchId,
        set_current: true,
      })
      setPanel(next)
      toast.success(`Set ${batchId} as current batch`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Set current failed")
    } finally {
      setRowBusy(null)
    }
  }

  const handleDelete = async (batchId: string) => {
    const ok = window.confirm(
      `Delete batch ${batchId}? This removes its assay values and file references from this panel. Files in MinIO are not deleted.`
    )
    if (!ok) return
    setRowBusy(batchId)
    try {
      const next = await deleteCoaBatch(product.id, batchId)
      setPanel(next)
      toast.success(`Deleted batch ${batchId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setRowBusy(null)
    }
  }

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      const next = await patchCoaPanel(product.id, {
        batch_id: "INITIAL-001",
        set_current: true,
      })
      setPanel(next)
      setLegacyTier(null)
      toast.success("Migrated COA panel to structured form")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Migration failed"
      toast.error(message)
    } finally {
      setMigrating(false)
    }
  }

  const handleSubmit = async () => {
    if (!BATCH_ID_RE.test(form.batchId)) {
      toast.error("batch_id must match ^[A-Z0-9-]+$")
      return
    }
    if (
      !form.standardCoa &&
      !form.extendedCoa &&
      !form.chromatogram &&
      !form.hplcPurity &&
      !form.endotoxin &&
      !form.refStandardMatch &&
      !form.lcmsConfirmed &&
      !form.lcmsMethodRef
    ) {
      toast.error("Provide at least one file or value")
      return
    }
    const isEdit = formMode.kind === "edit"
    if (
      !isEdit &&
      panel?.batches[form.batchId]
    ) {
      const ok = window.confirm(
        `Batch ${form.batchId} already exists. Re-uploading will overwrite existing fields. Continue?`
      )
      if (!ok) return
    }
    setSubmitting(true)
    try {
      const collected: Record<string, string> = {}
      const uploads: Array<[CoaFileKind, File]> = []
      if (form.standardCoa) uploads.push(["standard_coa", form.standardCoa])
      if (form.extendedCoa) uploads.push(["extended_coa", form.extendedCoa])
      if (form.chromatogram) uploads.push(["chromatogram", form.chromatogram])
      for (const [kind, file] of uploads) {
        const result = await uploadCoaFile(product.id, form.batchId, kind, file)
        collected[result.files_field] = result.url
      }
      const payload: Record<string, unknown> = {
        batch_id: form.batchId,
        set_current: form.setCurrent,
      }
      if (form.hplcPurity) payload.hplc_purity_pct = form.hplcPurity
      if (form.endotoxin) payload.endotoxin_eu_per_mg = form.endotoxin
      if (form.refStandardMatch)
        payload.ref_standard_match_pct = form.refStandardMatch
      if (form.lcmsConfirmed || form.lcmsMethodRef) {
        payload.lcms_identity = {
          confirmed: form.lcmsConfirmed,
          method_ref: form.lcmsMethodRef || undefined,
        }
      }
      if (Object.keys(collected).length > 0) payload.files = collected
      const next = await patchCoaPanel(product.id, payload)
      setPanel(next)
      toast.success(`Saved batch ${form.batchId}`)
      setDrawerOpen(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">COA panel</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Per-batch certificate of analysis files and assay values.
          </Text>
        </div>
        {panel ? (
          <>
            <Button
              size="small"
              variant="secondary"
              onClick={openNewBatchDrawer}
            >
              New batch
            </Button>
            <Drawer
              open={drawerOpen}
              onOpenChange={(open) => {
                setDrawerOpen(open)
                if (!open) resetForm()
              }}
            >
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>
                  {formMode.kind === "edit"
                    ? `Edit batch ${formMode.originalBatchId}`
                    : "New COA batch"}
                </Drawer.Title>
                <Drawer.Description>
                  {formMode.kind === "edit"
                    ? "Update assay values or replace files. Untouched fields are preserved."
                    : "Upload files and enter assay values for a new batch."}
                </Drawer.Description>
              </Drawer.Header>
              <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="coa-batch-id">Batch ID</Label>
                  <Input
                    id="coa-batch-id"
                    placeholder="e.g. RETA-2026-04-A"
                    value={form.batchId}
                    disabled={formMode.kind === "edit"}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        batchId: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Uppercase letters, digits, hyphens only.
                  </Text>
                </div>
                <FileField
                  label="Standard COA PDF"
                  file={form.standardCoa}
                  onFile={(f) => setForm((s) => ({ ...s, standardCoa: f }))}
                />
                <FileField
                  label="Extended COA PDF"
                  file={form.extendedCoa}
                  onFile={(f) => setForm((s) => ({ ...s, extendedCoa: f }))}
                />
                <FileField
                  label="Chromatogram PDF"
                  file={form.chromatogram}
                  onFile={(f) => setForm((s) => ({ ...s, chromatogram: f }))}
                />
                <div className="grid grid-cols-2 gap-x-4">
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="coa-hplc">HPLC purity %</Label>
                    <Input
                      id="coa-hplc"
                      placeholder="99.2"
                      value={form.hplcPurity}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, hplcPurity: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="coa-endo">Endotoxin (EU/mg)</Label>
                    <Input
                      id="coa-endo"
                      placeholder="< 5"
                      value={form.endotoxin}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, endotoxin: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="coa-ref">Ref standard match %</Label>
                    <Input
                      id="coa-ref"
                      placeholder="98.5"
                      value={form.refStandardMatch}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          refStandardMatch: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="coa-method">LC-MS/MS method ref</Label>
                    <Input
                      id="coa-method"
                      placeholder="USP <621>"
                      value={form.lcmsMethodRef}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          lcmsMethodRef: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <label className="flex items-center gap-x-2">
                  <input
                    type="checkbox"
                    checked={form.lcmsConfirmed}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        lcmsConfirmed: e.target.checked,
                      }))
                    }
                  />
                  <Text size="small">LC-MS/MS identity confirmed</Text>
                </label>
                <label className="flex items-center gap-x-2">
                  <input
                    type="checkbox"
                    checked={form.setCurrent}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, setCurrent: e.target.checked }))
                    }
                  />
                  <Text size="small">
                    Set as current batch (storefront panel reads from this)
                  </Text>
                </label>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close asChild>
                  <Button variant="secondary" disabled={submitting}>
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button
                  onClick={handleSubmit}
                  isLoading={submitting}
                  disabled={submitting || !form.batchId}
                >
                  {formMode.kind === "edit" ? "Save changes" : "Save batch"}
                </Button>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
          </>
        ) : null}
      </div>
      {!panel ? (
        <div className="flex flex-col gap-y-3 px-6 py-6">
          <Text size="small" className="text-ui-fg-subtle">
            {legacyTier
              ? `This product still uses the legacy "${legacyTier}" string for coa_panel. Migrate to the structured form to enable per-batch entry.`
              : "No COA panel set. Migrate to the structured form to start entering batches."}
          </Text>
          <div>
            <Button
              size="small"
              variant="secondary"
              onClick={handleMigrate}
              isLoading={migrating}
              disabled={migrating}
            >
              Migrate to structured panel
            </Button>
          </div>
        </div>
      ) : sortedBatchIds.length === 0 ? (
        <div className="px-6 py-6">
          <Text size="small" className="text-ui-fg-subtle">
            Tier: <Badge size="2xsmall">{panel.tier}</Badge>. No batches yet —
            click <em>New batch</em> to add one.
          </Text>
        </div>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle mb-2">
            Tier: <Badge size="2xsmall">{panel.tier}</Badge>
          </Text>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Batch ID</Table.HeaderCell>
                <Table.HeaderCell>Current</Table.HeaderCell>
                <Table.HeaderCell>Files</Table.HeaderCell>
                <Table.HeaderCell>HPLC %</Table.HeaderCell>
                <Table.HeaderCell>Endotoxin</Table.HeaderCell>
                <Table.HeaderCell>Ref match</Table.HeaderCell>
                <Table.HeaderCell>LC-MS/MS</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedBatchIds.map((batchId) => {
                const batch = batches[batchId]
                const isCurrent = panel.current_batch_id === batchId
                const busy = rowBusy === batchId
                return (
                  <Table.Row key={batchId}>
                    <Table.Cell className="font-mono">{batchId}</Table.Cell>
                    <Table.Cell>
                      {isCurrent ? (
                        <Badge size="2xsmall" color="green">
                          current
                        </Badge>
                      ) : (
                        <Text size="xsmall" className="text-ui-fg-muted">
                          —
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>{fileCount(batch)}</Table.Cell>
                    <Table.Cell>{batch.hplc_purity_pct ?? "—"}</Table.Cell>
                    <Table.Cell>{batch.endotoxin_eu_per_mg ?? "—"}</Table.Cell>
                    <Table.Cell>
                      {batch.ref_standard_match_pct ?? "—"}
                    </Table.Cell>
                    <Table.Cell>
                      {batch.lcms_identity?.confirmed ? "Y" : "N"}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <IconButton
                            size="small"
                            variant="transparent"
                            disabled={busy}
                            aria-label={`Actions for batch ${batchId}`}
                          >
                            <EllipsisHorizontal />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item
                            disabled={isCurrent || busy}
                            onClick={() => handleSetCurrent(batchId)}
                          >
                            Set as current
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            disabled={busy}
                            onClick={() => openEditDrawer(batchId)}
                          >
                            Edit values
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item
                            disabled={busy}
                            onClick={() => handleDelete(batchId)}
                            className="text-ui-fg-error"
                          >
                            Delete batch
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </Container>
  )
}

const FileField = ({
  label,
  file,
  onFile,
}: {
  label: string
  file: File | null
  onFile: (f: File | null) => void
}) => (
  <div className="flex flex-col gap-y-1">
    <Label>{label}</Label>
    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      className="text-ui-fg-base text-sm"
    />
    {file ? (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {file.name} ({Math.round(file.size / 1024)} KB)
      </Text>
    ) : null}
  </div>
)

export const config = defineWidgetConfig({ zone: "product.details.after" })

export default CoaPanelWidget
