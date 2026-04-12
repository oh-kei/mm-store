import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@medusajs/ui'; // Using Medusa UI if available, or custom
import { HttpTypes } from "@medusajs/types";
import { convertToLocale } from "@lib/util/money";

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
}

export function ProductCard({ product, region }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const title = product.title || "";
  const isPolo = title.toLowerCase().includes('polo');
  
  const poloColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Dark Gray', hex: '#4B5563' },
    { name: 'Light Gray', hex: '#D1D5DB' },
    { name: 'Dark Blue', hex: '#1E3A8A' },
    { name: 'Light Blue', hex: '#93C5FD' }
  ];

  // Price calculation for Medusa v2
  const variant = product.variants?.[0];
  const price = variant?.calculated_price;
  const formattedPrice = price ? convertToLocale({
    amount: price.calculated_amount,
    currency_code: price.currency_code,
  }) : "N/A";

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Quick add logic would go here, involving cart actions
    // For now, just simulating the UI state
    setIsAdding(true);
    setTimeout(() => {
        setIsAdding(false);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    }, 500);
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

          {/* Larger Color Swatches */}
          <div className="flex items-center gap-2 pt-2">
            {isPolo ? (
              poloColors.map((color) => (
                <div 
                  key={color.name}
                  className="w-4.5 h-4.5 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-4.5 h-4.5 rounded-full bg-gray-200 border border-black/10 shadow-sm" />
                <div className="w-4.5 h-4.5 rounded-full bg-gray-400 border border-black/10 shadow-sm" />
              </div>
            )}
          </div>
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
