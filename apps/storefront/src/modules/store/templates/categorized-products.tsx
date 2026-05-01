import { getProductsListWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"

type Category = {
  name: string
  description: string
  handles: string[]
}

const CATEGORIES: Category[] = [
  {
    name: "Repair",
    description:
      "Peptides studied in tendon, ligament, and gut-tissue repair models.",
    handles: ["bpc-157", "tb-500", "bpc-157-tb-500-blend"],
  },
  {
    name: "GH Axis",
    description:
      "Secretagogue compounds targeting the growth-hormone release axis.",
    handles: ["cjc-1295-no-dac-ipamorelin-blend"],
  },
  {
    name: "Longevity",
    description:
      "Compounds studied in cellular metabolism, oxidative stress, and mitochondrial function.",
    handles: ["glutathione", "nad", "mots-c"],
  },
  {
    name: "Metabolic",
    description:
      "Multi-receptor agonists studied in metabolic pathway research.",
    handles: ["cl-3r"],
  },
]

export default async function CategorizedProducts({
  countryCode,
}: {
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const {
    response: { products },
  } = await getProductsListWithSort({
    page: 1,
    queryParams: { limit: 100 },
    sortBy: "created_at",
    countryCode,
  })

  const productsByHandle = new Map(
    products.map((p: HttpTypes.StoreProduct) => [p.handle, p])
  )

  return (
    <div className="flex flex-col gap-16">
      {CATEGORIES.map((category) => {
        const categoryProducts = category.handles
          .map((h) => productsByHandle.get(h))
          .filter(Boolean) as HttpTypes.StoreProduct[]

        if (categoryProducts.length === 0) return null

        return (
          <section key={category.name}>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-normal text-calilean-ink">
                {category.name}
              </h2>
              <p className="text-sm text-calilean-fog mt-1">
                {category.description}
              </p>
            </div>
            <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
              {categoryProducts.map((p) => (
                <li key={p.id}>
                  <ProductPreview product={p} region={region} hideSubtitle />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
