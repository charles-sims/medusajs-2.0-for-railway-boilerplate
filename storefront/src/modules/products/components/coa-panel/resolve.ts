export type CoaTier = "standard" | "extended"

export type CoaBatchFiles = {
  standard_coa_pdf?: string
  extended_coa_pdf?: string
  chromatogram?: string
}

export type CoaBatchValues = {
  hplc_purity_pct?: string
  lcms_identity?: { confirmed: boolean; method_ref?: string }
  endotoxin_eu_per_mg?: string
  ref_standard_match_pct?: string
  files?: CoaBatchFiles
  issued_at?: string
}

export type CoaPanelStructured = {
  tier: CoaTier
  current_batch_id: string | null
  batches: Record<string, CoaBatchValues>
}

export type CoaPanelMeta = string | CoaPanelStructured

export type ResolvedCoaPanel = {
  tier: CoaTier
  effectiveTier: CoaTier
  batchId: string | null
  batch: CoaBatchValues | null
  pending: boolean
  extendedDeferred: boolean
}

const isStructured = (value: unknown): value is CoaPanelStructured => {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    (v.tier === "standard" || v.tier === "extended") &&
    typeof v.batches === "object" &&
    v.batches !== null
  )
}

const hasExtendedSignal = (batch: CoaBatchValues): boolean => {
  if (!batch) return false
  if (batch.lcms_identity) return true
  if (batch.endotoxin_eu_per_mg) return true
  if (batch.ref_standard_match_pct) return true
  if (batch.files?.extended_coa_pdf) return true
  return false
}

export const resolveCoaPanel = (raw: unknown): ResolvedCoaPanel => {
  if (typeof raw === "string") {
    const tier: CoaTier = raw === "extended" ? "extended" : "standard"
    return {
      tier,
      effectiveTier: tier,
      batchId: null,
      batch: null,
      pending: true,
      extendedDeferred: false,
    }
  }

  if (!isStructured(raw)) {
    return {
      tier: "standard",
      effectiveTier: "standard",
      batchId: null,
      batch: null,
      pending: true,
      extendedDeferred: false,
    }
  }

  const tier = raw.tier
  const batchKeys = Object.keys(raw.batches)
  let batchId: string | null = null
  if (raw.current_batch_id && raw.batches[raw.current_batch_id]) {
    batchId = raw.current_batch_id
  } else if (!raw.current_batch_id && batchKeys.length === 1) {
    batchId = batchKeys[0]
  }

  const batch = batchId ? raw.batches[batchId] : null
  const pending = !batch
  const extendedDeferred =
    tier === "extended" && !!batch && !hasExtendedSignal(batch)

  return {
    tier,
    effectiveTier: extendedDeferred ? "standard" : tier,
    batchId,
    batch,
    pending,
    extendedDeferred,
  }
}

const FILE_LABELS: Record<keyof CoaBatchFiles, string> = {
  standard_coa_pdf: "Standard COA",
  extended_coa_pdf: "Extended COA",
  chromatogram: "HPLC chromatogram",
}

export const buildFileLinks = (
  files: CoaBatchFiles | undefined
): { key: keyof CoaBatchFiles; label: string; href: string }[] => {
  if (!files) return []
  const order: (keyof CoaBatchFiles)[] = [
    "standard_coa_pdf",
    "extended_coa_pdf",
    "chromatogram",
  ]
  return order
    .filter((k) => typeof files[k] === "string" && (files[k] as string).length)
    .map((k) => ({ key: k, label: FILE_LABELS[k], href: files[k] as string }))
}
