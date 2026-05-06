import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import FeaturedCatalogue from "@modules/home/components/featured-catalogue"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Elevate your voyage with Mariners Market's. Discover our curated collection of premium maritime gear, professional apparel, and nautical lifestyle essentials.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  const filteredCollections = collections.filter(collection => 
    !collection.title.toLowerCase().includes('accessories') && 
    !collection.title.toLowerCase().includes('jackets') &&
    !collection.handle.toLowerCase().includes('accessories') && 
    !collection.handle.toLowerCase().includes('jackets')
  )

  return (
    <>
      <Hero />
      <FeaturedCatalogue />
    </>
  )
}
