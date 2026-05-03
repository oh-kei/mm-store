import { Metadata } from "next"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"
import { CatalogTemplate } from "@modules/catalog/templates"

export const metadata: Metadata = {
  title: "Catalogue | Mariners Market's",
  description: "Explore our collection of premium maritime gear.",
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  
  // Parallelize fetches for better performance
  const [productsData, region, customer] = await Promise.all([
    getProductsList({
      countryCode,
      queryParams: { limit: 100 },
    }),
    getRegion(countryCode),
    getCustomer(),
  ])

  const { response: { products } } = productsData

  if (!products || !region) {
    return null
  }

  return (
    <CatalogTemplate products={products} region={region} customer={customer} />
  )
}
