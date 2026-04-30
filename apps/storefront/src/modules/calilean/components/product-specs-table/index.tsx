import { HttpTypes } from "@medusajs/types"

type Props = {
  product: HttpTypes.StoreProduct
}

const ProductSpecsTable = ({ product }: Props) => {
  const meta = (product.metadata || {}) as Record<string, string>

  const specs = [
    { label: "Application", value: meta.application },
    { label: "Appearance", value: meta.appearance || "Solid, white powder in 3mL glass ampule" },
    { label: "Chemical Formula", value: meta.formula },
    { label: "CAS Number", value: meta.cas },
    { label: "Molecular Weight", value: meta.mw },
    { label: "PubChem CID", value: meta.pubchem },
    { label: "Storage", value: meta.storage },
  ].filter((s) => s.value)

  if (specs.length === 0) return null

  return (
    <section id="specifications" className="scroll-mt-24">
      <h2 className="text-lg font-bold text-calilean-ink mb-4 pb-2 border-b border-calilean-sand">
        Product Specifications
      </h2>
      <div className="rounded-lg border border-calilean-sand overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {specs.map((s, i) => (
              <tr
                key={s.label}
                className={i < specs.length - 1 ? "border-b border-calilean-sand" : ""}
              >
                <td className="py-3 px-4 font-medium text-calilean-fog bg-calilean-bg w-[140px] align-top">
                  {s.label}
                </td>
                <td className="py-3 px-4 text-calilean-ink">
                  {s.label === "Chemical Formula" ? (
                    <span className="font-mono">{s.value}</span>
                  ) : (
                    s.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ProductSpecsTable
