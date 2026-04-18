"use server"

import { sdk } from "@lib/config"

export async function search(query: string) {
  const { products } = await sdk.store.product.list({
    q: query,
    limit: 20,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.images",
  })

  return products.map((p) => ({
    ...p,
    objectID: p.id,
  }))
}
