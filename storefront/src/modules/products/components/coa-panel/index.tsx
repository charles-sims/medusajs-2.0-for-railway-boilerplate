import { HttpTypes } from "@medusajs/types"

type Props = {
  product: HttpTypes.StoreProduct
}

type CoaPanel = "standard" | "extended"

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

const COAPanel = ({ product }: Props) => {
  const meta = (product.metadata || {}) as Record<string, unknown>
  const panel: CoaPanel =
    typeof meta.coa_panel === "string" && meta.coa_panel === "extended"
      ? "extended"
      : "standard"

  const assays = panel === "extended" ? EXTENDED_ASSAYS : STANDARD_ASSAYS
  const heading =
    panel === "extended" ? "Certificate of Analysis (extended panel)" : "Certificate of Analysis"

  return (
    <div className="mt-8" data-testid={`coa-panel-${panel}`}>
      <h2 className="text-xl font-bold mb-2">{heading}</h2>
      <p className="text-sm text-bluum-muted mb-4">
        Every batch ships with a Certificate of Analysis covering the assays
        listed below. Per-batch values
        {typeof meta.batch === "string" && ` (batch ${meta.batch})`} are linked
        from the certificate file.
      </p>
      <ul className="divide-y divide-bluum-border">
        {assays.map((a) => (
          <li key={a.label} className="py-3">
            <p className="text-sm font-semibold text-bluum-text">{a.label}</p>
            <p className="text-sm text-bluum-muted mt-1">{a.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default COAPanel
