import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import JsonLd from "@modules/common/components/json-ld"
import { getBaseURL } from "@lib/util/env"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"

type Props = {
  params: { countryCode: string; handle: string }
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )

    if (!countryCodes) {
      return null
    }

    const products = await Promise.all(
      countryCodes.map((countryCode) => {
        return getProductsList({ countryCode })
      })
    ).then((responses) =>
      responses.map(({ response }) => response.products).flat()
    )

    const staticParams = countryCodes
      ?.map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle,
        }))
      )
      .flat()

    return staticParams
  } catch {
    // Backend unreachable at build time (e.g. CI without a running backend);
    // skip prerender and fall back to dynamic rendering at request time.
    return []
  }
}

function buildProductDescription(product: {
  description?: string | null
  title: string
}) {
  const raw = (product.description ?? "").trim()
  if (!raw) return product.title
  return raw.length > 160 ? `${raw.slice(0, 157)}…` : raw
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  const title = `${product.title} | CaliLean`
  const description = buildProductDescription(product)
  const image = product.thumbnail || product.images?.[0]?.url

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "CaliLean",
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

function buildProductJsonLd(
  product: any,
  countryCode: string
): Record<string, unknown> {
  const base = getBaseURL().replace(/\/$/, "")
  const url = `${base}/${countryCode}/products/${product.handle}`
  const images = (product.images ?? [])
    .map((img: { url?: string }) => img?.url)
    .filter(Boolean)

  const offers = (product.variants ?? [])
    .map((variant: any) => {
      const price = variant?.calculated_price
      if (!price?.calculated_amount) return null
      const inStock =
        typeof variant?.inventory_quantity === "number"
          ? variant.inventory_quantity > 0
          : true
      return {
        "@type": "Offer",
        url,
        priceCurrency: (price.currency_code || "usd").toUpperCase(),
        price: price.calculated_amount.toFixed(2),
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      }
    })
    .filter(Boolean)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: (product.description ?? product.title ?? "").trim(),
    sku: product.variants?.[0]?.sku || product.id,
    image: images.length ? images : undefined,
    url,
    brand: { "@type": "Brand", name: "CaliLean" },
    ...(offers.length === 1
      ? { offers: offers[0] }
      : offers.length > 1
      ? { offers }
      : {}),
  }
}

export default async function ProductPage({ params }: Props) {
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  const productJsonLd = buildProductJsonLd(pricedProduct, params.countryCode)

  return (
    <>
      <JsonLd data={productJsonLd} />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
