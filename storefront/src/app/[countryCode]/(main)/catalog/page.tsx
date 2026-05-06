import { Metadata } from "next"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"

export const dynamic = "force-dynamic"
import { CatalogTemplate } from "@modules/catalog/templates"

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Explore our collection of premium maritime gear.",
}

export default async function CatalogPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode } = params
  const { category } = searchParams
  
  // Only fetch a large amount of products if we're actually viewing a category
  // Otherwise, the landing page just shows category cards and doesn't need them.
  const limit = category ? 100 : 0

  // Parallelize fetches for better performance
  const [productsData, region, customer] = await Promise.all([
    getProductsList({
      countryCode,
      queryParams: { limit },
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
