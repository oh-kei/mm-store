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
  const { countryCode } = useParams() as { countryCode: string };
  const router = useRouter(); 
  const title = product.title || "";
  
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

  // Fetch unique colors from variants
  const colors = useMemo(() => {
    const colorOptions = product.options?.find(o => o.title?.toLowerCase().includes("color") || o.title?.toLowerCase().includes("colour"));
    if (!colorOptions) return [];
    return colorOptions.values?.map(v => v.value).filter(Boolean) as string[];
  }, [product.options]);

  // Price calculation for Medusa v2
  const variant = product.variants?.[0];
  const price = variant?.calculated_price;
  const formattedPrice = price && price.calculated_amount !== null && price.calculated_amount !== undefined && price.currency_code
    ? convertToLocale({
        amount: price.calculated_amount,
        currency_code: price.currency_code,
      }) 
    : "N/A";

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variant?.id) return;

    setIsAdding(true);
    try {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode,
      });
      setIsAdded(true);
      router.refresh(); // Update cart count in Nav
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group h-full flex flex-col transition-all duration-300 border-none rounded-none shadow-none hover:bg-gray-50/30">
      {/* Image Container with Custom #EDEEF3 Background */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EDEEF3] p-6 flex items-center justify-center">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No image
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

          {/* DYNAMIC COLOR SWATCHES: Added back for subpages */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {colors.map((color) => (
                <div 
                  key={color}
                  className="w-3 h-3 rounded-full border border-black/5 shadow-sm"
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
            className={`w-full h-9 text-[10px] uppercase tracking-widest font-bold text-white transition-all duration-300 rounded-none px-0 ${
              isAdded ? 'bg-green-600 border border-green-600' : 'bg-maritime-navy hover:bg-black border border-maritime-navy'
            }`}
            onClick={handleQuickAdd}
          >
            {isAdding ? 'Wait...' : isAdded ? 'Added ✓' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
