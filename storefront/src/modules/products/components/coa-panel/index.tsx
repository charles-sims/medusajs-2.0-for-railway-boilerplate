import { HttpTypes } from "@medusajs/types"

import {
  buildFileLinks,
  resolveCoaPanel,
  type CoaBatchValues,
  type CoaTier,
} from "./resolve"

type Props = {
  product: HttpTypes.StoreProduct
}

const STANDARD_ASSAYS: { label: string; detail: string }[] = [
  {
    label: "Purity by HPLC",
    detail:
      "Per-batch reverse-phase HPLC chromatogram showing purity percentage and impurity profile.",
  },
]

const EXTENDED_ASSAYS: { label: string; detail: string }[] = [
  ...STANDARD_ASSAYS,
  {
    label: "Identity confirmation by LC-MS/MS (triple-quad)",
    detail:
      "Mass-spec identity confirmation against the expected molecular ion to verify the compound is what the label claims.",
  },
  {
    label: "Independent endotoxin re-test",
    detail:
      "Per-batch LAL (Limulus amebocyte lysate) re-test by an independent lab in addition to the manufacturing facility's in-line check.",
  },
  {
    label: "Per-batch reference-standard comparison",
    detail:
      "Each batch is compared against an internally retained reference standard to catch drift between manufacturing runs.",
  },
]

const HEADINGS: Record<CoaTier, string> = {
  standard: "Certificate of Analysis",
  extended: "Certificate of Analysis (extended panel)",
}

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-2 inline-flex items-center rounded-pill border border-bluum-border px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-bluum-muted">
    {children}
  </span>
)

const ValueRow = ({ label, value }: { label: string; value: string }) => (
  <li className="flex items-baseline justify-between gap-4 py-2 text-sm">
    <span className="text-bluum-muted">{label}</span>
    <span className="font-mono font-semibold text-calilean-coa">{value}</span>
  </li>
)

const renderValueRows = (batch: CoaBatchValues, tier: CoaTier) => {
  const rows: { label: string; value: string }[] = []
  if (batch.hplc_purity_pct) {
    rows.push({ label: "HPLC purity", value: `${batch.hplc_purity_pct}%` })
  }
  if (tier === "extended") {
    if (batch.lcms_identity) {
      const ref = batch.lcms_identity.method_ref
      rows.push({
        label: "LC-MS/MS identity",
        value: batch.lcms_identity.confirmed
          ? ref
            ? `Confirmed · ${ref}`
            : "Confirmed"
          : "Not confirmed",
      })
    }
    if (batch.endotoxin_eu_per_mg) {
      rows.push({
        label: "Endotoxin",
        value: `${batch.endotoxin_eu_per_mg} EU/mg`,
      })
    }
    if (batch.ref_standard_match_pct) {
      rows.push({
        label: "Reference-standard match",
        value: `${batch.ref_standard_match_pct}%`,
      })
    }
  }
  if (rows.length === 0) return null
  return (
    <ul className="mt-4 divide-y divide-bluum-border rounded-base border border-bluum-border bg-calilean-sand/40 px-4">
      {rows.map((r) => (
        <ValueRow key={r.label} label={r.label} value={r.value} />
      ))}
    </ul>
  )
}

const COAPanel = ({ product }: Props) => {
  const meta = (product.metadata || {}) as Record<string, unknown>
  const resolved = resolveCoaPanel(meta.coa_panel)
  const { tier, effectiveTier, batchId, batch, pending, extendedDeferred } =
    resolved

  const assays = effectiveTier === "extended" ? EXTENDED_ASSAYS : STANDARD_ASSAYS
  const heading = HEADINGS[tier]
  const fileLinks = buildFileLinks(batch?.files)
  const displayBatchId =
    batchId || (typeof meta.batch === "string" ? meta.batch : null)

  return (
    <div className="mt-8" data-testid={`coa-panel-${effectiveTier}`}>
      <div className="mb-2 flex items-center">
        <h2 className="text-xl font-bold">{heading}</h2>
        {pending && <Pill>COA pending</Pill>}
        {extendedDeferred && <Pill>Extended panel pending</Pill>}
      </div>
      <p className="text-sm text-bluum-muted mb-4">
        Every batch ships with a Certificate of Analysis covering the assays
        listed below. Per-batch values
        {displayBatchId && ` (batch ${displayBatchId})`} are linked from the
        certificate file.
      </p>
      <ul className="divide-y divide-bluum-border">
        {assays.map((a) => (
          <li key={a.label} className="py-3">
            <p className="text-sm font-semibold text-bluum-text">{a.label}</p>
            <p className="text-sm text-bluum-muted mt-1">{a.detail}</p>
          </li>
        ))}
      </ul>
      {batch && renderValueRows(batch, effectiveTier)}
      {fileLinks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-bluum-text mb-2">
            Documents
          </h3>
          <ul className="flex flex-col gap-2">
            {fileLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm font-medium text-calilean-coa underline-offset-4 hover:underline"
                >
                  <span>{link.label}</span>
                  <span className="rounded-pill border border-calilean-coa/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-calilean-coa">
                    PDF
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default COAPanel
