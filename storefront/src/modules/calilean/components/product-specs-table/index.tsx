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
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Product Specifications</h2>
      <table className="w-full">
        <tbody className="divide-y divide-calilean-sand">
          {specs.map((s) => (
            <tr key={s.label}>
              <td className="py-3 pr-6 text-sm font-semibold text-calilean-ink w-48 align-top">{s.label}</td>
              <td className="py-3 text-sm text-calilean-fog">{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductSpecsTable
