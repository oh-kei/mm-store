import { HttpTypes } from "@medusajs/types"

/**
 * Finds a product image that matches the color of a specific variant.
 * Logic:
 * 1. Try to find the color value from variant options (searching for 'color' or 'colour').
 * 2. If not found, try to extract it from the variant title (assuming format "Size / Color").
 * 3. Match the color name against product image URLs using a regex pattern.
 * 4. Apply hardcoded fallbacks for specific products if necessary.
 */
export function getVariantImage(variant: HttpTypes.StoreProductVariant | undefined): string | null {
  if (!variant || !variant.product) return null

  // Try to find the color value from options or title
  const colorOption = variant.options?.find(o => 
    ["color", "colour"].some(t => o.option?.title?.toLowerCase().includes(t))
  )
  const colorValue = colorOption?.value || variant.title?.split(" / ").pop()

  if (colorValue) {
    const normalizedColor = colorValue.toLowerCase().replace(/\s+/g, "")
    const escapedColor = colorValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedNormalized = normalizedColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`[-_](${escapedColor}|${escapedNormalized})([-_.]|$)`, "i")

    const colorMatch = variant.product.images?.find(img => pattern.test(img.url || ""));
    if (colorMatch?.url) return colorMatch.url;
  }

  // Hardcoded fallbacks for Rashguard and T-shirt if pattern matching fails
  if (variant.product.handle === "technical-long-sleeve-rashguard") {
    const isNavy = colorValue?.toLowerCase().includes("navy")
    if (isNavy) return "https://bucket-production-bd41.up.railway.app/medusa-media/mm-rashguard-navy-01KPA0EFE7M2E7K6C5Z0S8V4C4.webp"
    return "https://bucket-production-bd41.up.railway.app/medusa-media/mm-rashguard-black-01KPA0EEFK50TC99MNDS685YFC.webp"
  }

  if (variant.product.handle === "short-sleeve-t-shirt") {
    const isBlue = colorValue?.toLowerCase().includes("blue")
    if (isBlue) return "https://bucket-production-bd41.up.railway.app/medusa-media/mm-tshirt-blue-01KPA0GV69A2MGV0K4CC4Z67VQ.webp"
  }

  return null
}
