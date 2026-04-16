import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, clx } from '@medusajs/ui';
import { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@lib/util/money";
import { addToCart } from "@lib/data/cart";
import { useParams, useRouter } from "next/navigation";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
}

export function ProductCard({ product, region }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const { countryCode } = useParams() as { countryCode: string };
  const router = useRouter(); 
  const title = product.title || "";
  
  // Custom Image Overrides
  const productImage = useMemo(() => {
    if (product.handle === "technical-long-sleeve-rashguard") {
      return "https://bucket-production-bd41.up.railway.app/medusa-media/mm-rashguard-black-01KPA0EEFK50TC99MNDS685YFC.webp"
    }
    if (product.handle === "short-sleeve-t-shirt") {
      return "https://bucket-production-bd41.up.railway.app/medusa-media/mm-tshirt-blue-01KPA0GV69A2MGV0K4CC4Z67VQ.webp"
    }
    return product.thumbnail
  }, [product.handle, product.thumbnail])
  
  // Get all unique sizes and colors
  const { sizes, colors } = useMemo(() => {
    const s = product.options?.find(o => o.title?.toLowerCase().includes("size"))?.values?.map(v => v.value).filter(Boolean) as string[] || [];
    const c = product.options?.find(o => o.title?.toLowerCase().includes("color") || o.title?.toLowerCase().includes("colour"))?.values?.map(v => v.value).filter(Boolean) as string[] || [];
    return { sizes: s, colors: c };
  }, [product.options]);
  
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
      yellow: "#F59E0B",
    }
    return map[colorName.toLowerCase()] || "#E5E7EB"
  }

  const variant = useMemo(() => {
    if (!selectedColor) return product.variants?.[0];
    return product.variants?.find(v => v.options?.some(o => o.value === selectedColor)) || product.variants?.[0];
  }, [product.variants, selectedColor]);

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
    if (sizes.length > 1) {
      setShowSizeSelector(true);
    } else {
      handleAddToCart();
    }
  };

  return (
    <div className="group h-full flex flex-col transition-all duration-300 border-none rounded-none shadow-none hover:bg-gray-50/30 relative">
      {/* Image Container with Custom #EDEEF3 Background */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EDEEF3] p-2 flex items-center justify-center">
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
        
        {/* Size Selector Overlay */}
        {showSizeSelector && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
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
      </div>

      <div className="space-y-3 p-5 flex-grow flex flex-col">
        <div className="flex-grow space-y-1.5">
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

          {/* DYNAMIC COLOR SWATCHES */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {colors.map((color) => (
                <button 
                  key={color}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedColor(color); }}
                  className={clx("w-3 h-3 rounded-full border shadow-sm transition-all duration-300", {
                    "border-black/40 scale-125 ring-1 ring-black/10": selectedColor === color,
                    "border-black/5": selectedColor !== color
                  })}
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Permanent Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <Link href={`/products/${product.handle}`} className="w-full">
            <button 
              className="w-full h-9 text-[10px] uppercase tracking-widest font-bold border border-gray-200 text-gray-900 hover:bg-maritime-navy hover:text-white hover:border-maritime-navy transition-all duration-300 rounded-none px-0"
            >
              Details
            </button>
          </Link>
          <button 
            disabled={isAdding}
            className={clx("w-full h-9 text-[10px] uppercase tracking-widest font-bold text-white transition-all duration-300 rounded-none px-0", {
              "bg-green-600 border border-green-600": isAdded,
              "bg-maritime-navy hover:bg-black border border-maritime-navy": !isAdded,
              "opacity-50 cursor-not-allowed": isAdding
            })}
            onClick={handleQuickAddClick}
          >
            {isAdding ? 'Wait...' : isAdded ? 'Added ✓' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
