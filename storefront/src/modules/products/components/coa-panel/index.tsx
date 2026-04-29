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
  <span className="ml-2 inline-flex items-center rounded-full border border-calilean-sand px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-calilean-fog">
    {children}
  </span>
)

const ValueRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-calilean-sand p-3">
    <p className="text-[10px] uppercase tracking-widest text-calilean-fog">{label}</p>
    <p className="text-sm font-semibold text-calilean-ink mt-1">{value}</p>
  </div>
)

const renderValueGrid = (batch: CoaBatchValues, tier: CoaTier) => {
  const items: { label: string; value: string }[] = []
  if (batch.hplc_purity_pct) {
    items.push({ label: "HPLC Purity", value: `${batch.hplc_purity_pct}%` })
  }
  if (tier === "extended") {
    if (batch.lcms_identity) {
      items.push({
        label: "LCMS Identity",
        value: batch.lcms_identity.confirmed ? "✓ Confirmed" : "Not confirmed",
      })
    }
    if (batch.endotoxin_eu_per_mg) {
      items.push({ label: "Endotoxin", value: `${batch.endotoxin_eu_per_mg} EU/mg` })
    }
    if (batch.ref_standard_match_pct) {
      items.push({ label: "Ref Standard Match", value: `${batch.ref_standard_match_pct}%` })
    }
  }
  if (items.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {items.map((item) => (
        <ValueRow key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  )
}

const COAPanel = ({ product }: Props) => {
  const meta = (product.metadata || {}) as Record<string, unknown>
  const resolved = resolveCoaPanel(meta.coa_panel)
  const { tier, effectiveTier, batchId, batch, pending, extendedDeferred } =
    resolved

  const heading = HEADINGS[tier]
  const fileLinks = buildFileLinks(batch?.files)
  const displayBatchId =
    batchId || (typeof meta.batch === "string" ? meta.batch : null)

  return (
    <section id="certificate-of-analysis" className="scroll-mt-24" data-testid={`coa-panel-${effectiveTier}`}>
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        {heading}
        {pending && <Pill>COA pending</Pill>}
        {extendedDeferred && <Pill>Extended panel pending</Pill>}
      </h2>

      <div className="rounded-lg border border-calilean-sand bg-calilean-bg p-5">
        {displayBatchId && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-calilean-ink">Batch #{displayBatchId}</p>
              {batch?.issued_at && (
                <p className="text-[11px] text-calilean-fog mt-0.5">
                  Issued: {new Date(batch.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
            {batch?.hplc_purity_pct && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#7090AB]/10 text-[#7090AB] text-xs font-semibold">
                {batch.hplc_purity_pct}% HPLC Purity
              </span>
            )}
          </div>
        )}

        {batch && renderValueGrid(batch, effectiveTier)}

        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest text-calilean-fog mb-2">
            Assays included
          </p>
          <ul className="space-y-2">
            {(effectiveTier === "extended" ? EXTENDED_ASSAYS : STANDARD_ASSAYS).map((a) => (
              <li key={a.label} className="text-xs text-calilean-fog">
                <span className="font-medium text-calilean-ink">{a.label}</span>
                {" — "}
                {a.detail}
              </li>
            ))}
          </ul>
        </div>

        {fileLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-calilean-sand">
            {fileLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-calilean-sand text-xs font-medium text-[#7090AB] hover:bg-[#7090AB]/5 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default COAPanel
