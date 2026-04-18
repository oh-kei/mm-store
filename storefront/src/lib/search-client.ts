import { search } from "@modules/search/actions"

export const SEARCH_INDEX_NAME =
  process.env.NEXT_PUBLIC_INDEX_NAME || "products"

export const searchClient = {
  async search(requests: any[]) {
    const results = await Promise.all(
      requests.map(async (request) => {
        const { query } = request.params
        
        // Proxy the search through the server action to avoid CORS
        const hits = await search(query)

        return {
          hits,
          nbHits: hits.length,
          query,
          page: 0,
          nbPages: 1,
          hitsPerPage: 20,
          processingTimeMS: 1,
        }
      })
    )

    return { results }
  },
}
