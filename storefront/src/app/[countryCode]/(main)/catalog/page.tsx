import { Metadata } from "next"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { CatalogTemplate } from "@modules/catalog/templates"

export const metadata: Metadata = {
  title: "Catalogue | Mariners Market",
  description: "Explore our collection of premium maritime gear.",
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  
  // Fetch all products for client-side filtering
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: { limit: 100 },
  })

  const region = await getRegion(countryCode)

  if (!products || !region) {
    return null
  }

  return (
    <CatalogTemplate products={products} region={region} />
  )
}
