import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { CustomizerTemplate } from "@modules/customizer/templates"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ countryCode: string }>
}

export default async function CustomStudioPage({ params }: Props) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  // Fetch all products for the studio catalog
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: { limit: 100 }
  })

  return (
    <CustomizerTemplate 
      products={products} 
      region={region}
    />
  )
}
