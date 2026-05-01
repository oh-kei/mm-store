"use server"

import { sdk } from "@lib/config"

export async function search(query: string) {
  const { products } = await sdk.store.product.list({
    q: query,
    limit: 20,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.images",
  })

  // Improve search relevance by sorting hits based on title matches
  const q = query.toLowerCase().trim()
  
  const sortedProducts = [...products].sort((a, b) => {
    const aTitle = (a.title || "").toLowerCase()
    const bTitle = (b.title || "").toLowerCase()

    // 1. Exact match (or exact match minus 's')
    const aExact = aTitle === q || aTitle === q + 's' || aTitle + 's' === q
    const bExact = bTitle === q || bTitle === q + 's' || bTitle + 's' === q
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1

    // 2. Starts with query
    const aStarts = aTitle.startsWith(q)
    const bStarts = bTitle.startsWith(q)
    if (aStarts && !bStarts) return -1
    if (!aStarts && bStarts) return 1

    // 3. Contains query as a word
    const aWord = new RegExp(`\\b${q}\\b`, 'i').test(aTitle)
    const bWord = new RegExp(`\\b${q}\\b`, 'i').test(bTitle)
    if (aWord && !bWord) return -1
    if (!aWord && bWord) return 1

    // 4. Just contains the query
    const aContains = aTitle.includes(q)
    const bContains = bTitle.includes(q)
    if (aContains && !bContains) return -1
    if (!aContains && bContains) return 1

    return 0
  })

  return sortedProducts.map((p) => ({
    ...p,
    objectID: p.id,
  }))
}
