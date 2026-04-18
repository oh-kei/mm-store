import { Heading, Text } from "@medusajs/ui"
import { getProductByHandle } from "@lib/data/products"
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

  // Fetch default product for customization
  const product = await getProductByHandle("short-sleeve-t-shirt", region.id)

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-40 pb-20 px-8 flex flex-col items-center text-center">
        <div className="max-w-2xl">
          <Heading className="text-5xl font-black text-maritime-navy mb-8 uppercase tracking-tighter">
            Studio Maintenance
          </Heading>
          <Text className="text-lg text-slate-600 mb-12 leading-relaxed">
            We're currently stocking the studio with premium apparel bases. Please check back shortly.
          </Text>
        </div>
      </div>
    )
  }

  return <CustomizerTemplate product={product} />
}
