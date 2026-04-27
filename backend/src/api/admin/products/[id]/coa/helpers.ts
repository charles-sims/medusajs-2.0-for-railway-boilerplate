export type CoaFileKind = "standard_coa" | "extended_coa" | "chromatogram"

export const COA_FILE_KINDS: readonly CoaFileKind[] = [
  "standard_coa",
  "extended_coa",
  "chromatogram",
] as const

const COA_FILENAME_BY_KIND: Record<CoaFileKind, string> = {
  standard_coa: "standard-coa.pdf",
  extended_coa: "extended-coa.pdf",
  chromatogram: "chromatogram.pdf",
}

const COA_FILES_FIELD_BY_KIND: Record<
  CoaFileKind,
  "standard_coa_pdf" | "extended_coa_pdf" | "chromatogram"
> = {
  standard_coa: "standard_coa_pdf",
  extended_coa: "extended_coa_pdf",
  chromatogram: "chromatogram",
}

export function filenameForKind(kind: CoaFileKind): string {
  return COA_FILENAME_BY_KIND[kind]
}

export function filesFieldForKind(
  kind: CoaFileKind
): "standard_coa_pdf" | "extended_coa_pdf" | "chromatogram" {
  return COA_FILES_FIELD_BY_KIND[kind]
}

export function isCoaFileKind(value: unknown): value is CoaFileKind {
  return (
    typeof value === "string" &&
    (COA_FILE_KINDS as readonly string[]).includes(value)
  )
}

export type CoaBatch = {
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

export type CoaPanel = {
  tier: string
  current_batch_id: string | null
  batches: Record<string, CoaBatch>
}

/**
 * Migrate the legacy string form (`'standard'|'extended'`) into the structured
 * object form. If already structured, returns a normalized copy with defaults
 * filled in for missing fields.
 */
export function migrateCoaPanel(input: unknown): CoaPanel {
  if (typeof input === "string") {
    return { tier: input, current_batch_id: null, batches: {} }
  }
  if (input && typeof input === "object") {
    const obj = input as Partial<CoaPanel>
    return {
      tier: typeof obj.tier === "string" ? obj.tier : "standard",
      current_batch_id:
        typeof obj.current_batch_id === "string" ? obj.current_batch_id : null,
      batches:
        obj.batches && typeof obj.batches === "object" ? { ...obj.batches } : {},
    }
  }
  return { tier: "standard", current_batch_id: null, batches: {} }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v)
}

/**
 * Deep-merge `incoming` onto `base`. Plain objects merge recursively; arrays
 * and primitives are replaced. Used to PATCH a single batch entry without
 * dropping previously-uploaded fields.
 */
export function deepMerge<T>(base: T, incoming: Partial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(incoming)) {
    return (incoming === undefined ? base : incoming) as T
  }
  const out: Record<string, unknown> = { ...base }
  for (const [k, v] of Object.entries(incoming)) {
    if (v === undefined) continue
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMerge(out[k], v as Record<string, unknown>)
    } else {
      out[k] = v
    }
  }
  return out as T
}

export type CoaPanelPatchInput = {
  batch_id: string
  hplc_purity_pct?: string
  lcms_identity?: { confirmed?: boolean; method_ref?: string }
  endotoxin_eu_per_mg?: string
  ref_standard_match_pct?: string
  files?: {
    standard_coa_pdf?: string
    extended_coa_pdf?: string
    chromatogram?: string
  }
  set_current?: boolean
}

/**
 * Apply a single batch PATCH to a panel. Returns a new panel object.
 *
 * - Migrates the legacy string form first.
 * - Deep-merges the incoming fields into `batches[batch_id]`.
 * - Sets `current_batch_id` when `set_current === true`, or when the batch is
 *   being introduced for the first time and `set_current` is omitted.
 */
export function applyBatchPatch(
  panel: unknown,
  patch: CoaPanelPatchInput
): CoaPanel {
  if (!patch.batch_id || typeof patch.batch_id !== "string") {
    throw new Error("batch_id is required")
  }

  const next = migrateCoaPanel(panel)
  const isNewBatch = !next.batches[patch.batch_id]

  const incoming: CoaBatch = {}
  if (patch.hplc_purity_pct !== undefined)
    incoming.hplc_purity_pct = patch.hplc_purity_pct
  if (patch.lcms_identity !== undefined)
    incoming.lcms_identity = patch.lcms_identity
  if (patch.endotoxin_eu_per_mg !== undefined)
    incoming.endotoxin_eu_per_mg = patch.endotoxin_eu_per_mg
  if (patch.ref_standard_match_pct !== undefined)
    incoming.ref_standard_match_pct = patch.ref_standard_match_pct
  if (patch.files !== undefined) incoming.files = patch.files

  next.batches[patch.batch_id] = deepMerge(
    next.batches[patch.batch_id] || {},
    incoming
  )

  const setCurrent =
    patch.set_current === undefined ? isNewBatch : patch.set_current
  if (setCurrent) {
    next.current_batch_id = patch.batch_id
  }

  return next
}

/**
 * Resolve the SKU we use to namespace COA objects in MinIO. Prefers
 * `product.metadata.sku`, falls back to `product.handle`.
 */
export function resolveCoaSku(product: {
  handle?: string | null
  metadata?: Record<string, unknown> | null
}): string {
  const metaSku = product.metadata?.sku
  if (typeof metaSku === "string" && metaSku.length > 0) return metaSku
  if (typeof product.handle === "string" && product.handle.length > 0)
    return product.handle
  throw new Error("Cannot resolve SKU: product has no handle or metadata.sku")
}

export function buildCoaObjectKey(
  sku: string,
  batchId: string,
  filename: string
): string {
  return `coa/${sku}/${batchId}/${filename}`
}

/**
 * Strip a trailing slash from a base URL and join with an object key.
 */
export function buildCoaPublicUrl(publicBase: string, key: string): string {
  const base = publicBase.replace(/\/$/, "")
  return `${base}/${key}`
}
