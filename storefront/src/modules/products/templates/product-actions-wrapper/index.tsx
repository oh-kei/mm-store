import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { getCustomer } from "@lib/data/customer"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const productPromise = getProductsById({
    ids: [id],
    regionId: region.id,
  })

  const customerPromise = getCustomer()

  const [[product], customer] = await Promise.all([
     productPromise,
     customerPromise
  ])

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} customer={customer} />
}
