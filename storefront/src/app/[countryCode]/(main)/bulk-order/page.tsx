import { Metadata } from "next"
import { getProductsList } from "@lib/data/products"
import BulkOrderLayout from "@modules/bulk-order/templates/bulk-order-layout"
import { PortalContainer } from "@modules/bulk-order/templates/portal-container"

export const metadata: Metadata = {
  title: "Bulk Order | Mariners Market's",
  description: "B2B Team Portal for bulk fleet orders.",
}

export default async function BulkOrderPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  
  // Fetch products for the bulk catalog
  const { response: { products } } = await getProductsList({
    countryCode,
    queryParams: { limit: 100 },
  })

  // We wrap the entire page in the custom BulkOrderLayout
  // to give it the specialized "Pro" feel.
  return (
    <BulkOrderLayout>
      <PortalContainer products={products || []} />
    </BulkOrderLayout>
  )
}
