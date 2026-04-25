import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { HttpTypes } from "@medusajs/types"

export const listRegions = cache(async function () {
  return sdk.store.region
    .list({}, { next: { tags: ["regions"] } })
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ["regions"] } })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  console.time(`getRegion: ${countryCode}`)
  try {
    if (regionMap.has(countryCode)) {
      console.timeEnd(`getRegion: ${countryCode}`)
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions) {
      console.timeEnd(`getRegion: ${countryCode}`)
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    console.timeEnd(`getRegion: ${countryCode}`)
    return region
  } catch (e: any) {
    console.timeEnd(`getRegion: ${countryCode}`)
    return null
  }
})
