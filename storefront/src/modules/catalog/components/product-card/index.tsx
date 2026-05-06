import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, clx } from '@medusajs/ui';
import { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@lib/util/money";
import { addToCart } from "@lib/data/cart";
import { useParams, useRouter } from "next/navigation";
import { getVariantImage } from "@modules/products/utils/get-variant-image";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  customer?: HttpTypes.StoreCustomer | null;
  mode?: "default" | "customizer"
}

export function ProductCard({ product, region, customer, mode = "default" }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showColorError, setShowColorError] = useState(false);
  const { countryCode } = useParams() as { countryCode: string };
  const router = useRouter(); 
  const title = product.title || "";
  
  // Custom Image Overrides and Color Matching
  const displayColor = hoveredColor || selectedColor;

  const variant = useMemo(() => {
    if (displayColor) {
      return product.variants?.find(v => v.options?.some(o => o.value === displayColor)) || product.variants?.[0];
    }
    
    // Use the product ID to pick a consistent but "random" starting variant for variety
    if (product.variants && product.variants.length > 0) {
      const charSum = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const variantIndex = charSum % product.variants.length;
      return product.variants[variantIndex];
    }

    return product.variants?.[0];
  }, [product.variants, displayColor, product.id]);

  const productImage = useMemo(() => {
    return getVariantImage(variant, product) || product.thumbnail;
  }, [variant, product]);

  const getColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      black: "#000000",
      white: "#FFFFFF",
      navy: "#1E3A8A",
      grey: "#4B5563",
      gray: "#4B5563",
      blue: "#3B82F6",
      red: "#EF4444",
      green: "#10B981",
      yellow: "#FFD700",
      cyan: "#06B6D4",
      "light green": "#86EFAC",
      lightgreen: "#86EFAC",
      "light blue": "#ADD8E6",
      lightblue: "#ADD8E6",
      "dark blue": "#1E3A8A",
      orange: "#F97316",
      "cool blue": "#60A5FA",
      "khaki": "#C3B091",
      "dark green": "#064E3B",
      "red black": "linear-gradient(135deg, #EF4444 50%, #000000 50%)",
      "blue black": "linear-gradient(135deg, #3B82F6 50%, #000000 50%)",
      "red/black": "linear-gradient(135deg, #EF4444 50%, #000000 50%)",
      "blue/black": "linear-gradient(135deg, #3B82F6 50%, #000000 50%)",
    }
    return map[colorName.toLowerCase()] || "#E5E7EB"
  }

  const getLuminance = (color: string) => {
    if (color.includes('gradient')) return 0.5;
    const hex = color.replace('#', '');
    if (hex.length !== 6) return 0.5;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // Get all unique sizes and colors
  const { sizes, colors } = useMemo(() => {
    const s = product.options?.find(o => o.title?.toLowerCase().includes("size"))?.values?.map(v => v.value).filter(Boolean) as string[] || [];
    const c = (product.options?.find(o => o.title?.toLowerCase().includes("color") || o.title?.toLowerCase().includes("colour"))?.values?.map(v => v.value).filter(Boolean) as string[] || []);
    
    const sortedColors = [...c].sort((a, b) => {
      const lumA = getLuminance(getColorHex(a));
      const lumB = getLuminance(getColorHex(b));
      return lumB - lumA; // Pure Luminance: Lightest to Darkest
    });

    return { sizes: s, colors: sortedColors };
  }, [product.options]);

  const price = variant?.calculated_price;
  const formattedPrice = price && price.calculated_amount !== null && price.calculated_amount !== undefined && price.currency_code
    ? convertToLocale({
        amount: price.calculated_amount,
        currency_code: price.currency_code,
      }) 
    : "N/A";

  const handleAddToCart = async (size?: string) => {
    const targetVariant = size 
      ? product.variants?.find(v => v.options?.some(o => o.value === size) && (!selectedColor || v.options?.some(o => o.value === selectedColor)))
      : variant;

    if (!targetVariant?.id) return;

    setIsAdding(true);
    try {
      await addToCart({
        variantId: targetVariant.id,
        quantity: 1,
        countryCode,
      });
      setIsAdded(true);
      setShowSizeSelector(false);
      router.refresh();
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!customer) {
      router.push(`/${countryCode}/account`);
      return;
    }

    if (colors.length > 0 && !selectedColor) {
      setShowColorError(true);
      setTimeout(() => setShowColorError(false), 3000);
      return;
    }

    if (sizes.length > 1) {
      setShowSizeSelector(true);
    } else {
      handleAddToCart();
    }
  };

  return (
    <div className="group h-full flex flex-col transition-all duration-300 border-none rounded-none shadow-none hover:bg-gray-50/30 relative">
      <div className="flex flex-col flex-grow">
        {/* Wrap the main content in either a Link (default) or a div (customizer) */}
        {(() => {
          const Content = (
            <>
              {/* Image Container with Custom #EDEEF3 Background */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#EDEEF3] p-2 flex items-center justify-center">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={title}
                    className="w-full h-full object-contain mix-blend-multiply scale-[1.1] group-hover:scale-[1.15] transition-transform duration-1000 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No image
                  </div>
                )}
                
                {/* Size Selector Overlay (Only in default mode) */}
                {mode !== "customizer" && showSizeSelector && (
                  <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-maritime-navy">Select Size</h4>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {sizes.map(size => (
                        <button
                          key={size}
                          onClick={(e) => { e.preventDefault(); handleAddToCart(size); }}
                          className="h-10 border border-gray-200 text-[10px] font-bold hover:bg-maritime-navy hover:text-white transition-all"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); setShowSizeSelector(false); }}
                      className="mt-4 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Color Error Overlay (Only in default mode) */}
                {mode !== "customizer" && showColorError && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-center">
                    <div className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                      Select a colour
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 pb-0 space-y-1.5">
                {product.type?.value && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-maritime-navy/40 font-black">
                    {product.type.value}
                  </p>
                )}
                <h3 className="font-bold text-xs text-gray-900 group-hover:text-maritime-navy transition-colors tracking-tight uppercase font-sans">
                  {title}
                </h3>
                
                <div className="flex items-center justify-between pt-1">
                  <p className="font-black text-sm text-maritime-navy">
                    {formattedPrice}
                  </p>
                </div>
              </div>
            </>
          )

          if (mode === "customizer") {
            return (
              <div className="flex flex-col cursor-pointer">
                {Content}
              </div>
            )
          }

          return (
            <Link href={`/products/${product.handle}`} className="flex flex-col">
              {Content}
            </Link>
          )
        })()}

        <div className="px-5 pb-5 pt-3">
          {/* DYNAMIC COLOR SWATCHES - Outside the Link to fix nesting and navigation */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1" onMouseLeave={() => setHoveredColor(null)}>
              {colors.map((color) => (
                <button 
                  key={color}
                  onMouseEnter={() => setHoveredColor(color)}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setSelectedColor(color); 
                  }}
                  className={clx("w-3 h-3 rounded-full border border-black/10 shadow-sm transition-all duration-300 overflow-hidden p-0 block", {
                    "border-black/60 scale-125 ring-2 ring-black/5": selectedColor === color,
                  })}
                  style={{ 
                    background: getColorHex(color),
                    backgroundSize: '150% 150%',
                    backgroundPosition: 'center',
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Permanent Action Buttons */}
      <div className={clx("p-5 pt-0", mode === "customizer" ? "flex" : "grid grid-cols-2 gap-2")}>
        {mode === "customizer" ? (
           <button 
            className="w-full h-9 text-[10px] uppercase tracking-widest font-bold bg-maritime-navy text-white hover:bg-black transition-all duration-300 rounded-none px-0"
          >
            Customise
          </button>
        ) : (
          <>
            <Link href={`/products/${product.handle}`} className="w-full">
              <button 
                className="w-full h-9 text-[10px] uppercase tracking-widest font-bold border border-gray-200 text-gray-900 hover:bg-maritime-navy hover:text-white hover:border-maritime-navy transition-all duration-300 rounded-none px-0"
              >
                Details
              </button>
            </Link>
            <button 
              disabled={isAdding}
              className={clx("w-full h-9 text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-white transition-all duration-300 rounded-none px-0", {
                "bg-green-600 border border-green-600": isAdded,
                "bg-maritime-navy hover:bg-black border border-maritime-navy": !isAdded,
                "opacity-50 cursor-not-allowed": isAdding
              })}
              onClick={handleQuickAddClick}
            >
              {isAdding ? 'Wait...' : isAdded ? 'Added ✓' : !customer ? 'Sign In to Add to Bag' : 'Add to Cart'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
