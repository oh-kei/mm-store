"use client"

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '../components/product-card';
import { FilterDropdown } from '../components/filter-dropdown';
import { HttpTypes } from "@medusajs/types";

const FILTER_OPTIONS = {
  types: ['All', 'Tops', 'Polo Shirts', 'Midlayers', 'Jackets', 'Hats', 'Bags', 'Banners/Event items'],
  sizes: ['All', 'S', 'M', 'L', 'XL'],
  colors: ['All', 'Black', 'White', 'Navy', 'Grey'],
  genders: ['All', 'Men', 'Women', 'Unisex']
};

interface CatalogTemplateProps {
  products: HttpTypes.StoreProduct[];
  region: HttpTypes.StoreRegion;
}

export function CatalogTemplate({ products, region }: CatalogTemplateProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter state from URL
  const typeFilter = searchParams.get('category') || 'All';
  const sizeFilter = searchParams.get('size') || 'All';
  const colorFilter = searchParams.get('color') || 'All';
  const genderFilter = searchParams.get('gender') || 'All';

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      // 1. Type Filter
      if (typeFilter !== 'All') {
        const productType = product.type?.value?.toLowerCase().replace(' ', '-');
        const targetType = typeFilter.toLowerCase().replace(' ', '-');
        if (productType !== targetType) return false;
      }

      // 2. Attribute Filters (Size, Color, Gender)
      const matchOption = (title: string, value: string) => {
        if (value === 'All') return true;
        return product.variants?.some((v: any) => 
          v.options?.some((vo: any) => {
            // In Medusa v2, option names might be different, but let's assume 'Size' and 'Color'
            // We can also check product.options
            const opt = product.options?.find((o: any) => o.id === vo.option_id || o.title.toLowerCase() === title.toLowerCase());
            return vo.value === value;
          })
        );
      };

      if (!matchOption('Size', sizeFilter)) return false;
      if (!matchOption('Color', colorFilter)) return false;
      
      if (genderFilter !== 'All') {
        const hasGenderTag = product.tags?.some((t: any) => t.value.toLowerCase() === genderFilter.toLowerCase());
        if (!hasGenderTag) return false;
      }

      return true;
    });
  }, [products, typeFilter, sizeFilter, colorFilter, genderFilter]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'All') {
      params.delete(key === 'Type' ? 'category' : key.toLowerCase());
    } else {
      params.set(key === 'Type' ? 'category' : key.toLowerCase(), value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Top-Bar Filters */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-6 mb-12 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-maritime-navy">Filter By</span>
            <div className="h-px w-8 bg-maritime-navy/20"></div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <FilterDropdown 
              title="Type" 
              options={FILTER_OPTIONS.types} 
              current={typeFilter} 
              onChange={(v: string) => updateFilters('Type', v)} 
            />
            <FilterDropdown 
              title="Size" 
              options={FILTER_OPTIONS.sizes} 
              current={sizeFilter} 
              onChange={(v: string) => updateFilters('Size', v)} 
            />
            <FilterDropdown 
              title="Color" 
              options={FILTER_OPTIONS.colors} 
              current={colorFilter} 
              onChange={(v: string) => updateFilters('Color', v)} 
            />
            <FilterDropdown 
              title="Gender" 
              options={FILTER_OPTIONS.genders} 
              current={genderFilter} 
              onChange={(v: string) => updateFilters('Gender', v)} 
            />
          </div>

          <button 
            onClick={() => router.push(pathname)}
            className="ml-auto text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-maritime-navy transition-colors"
          >
            Reset All
          </button>
        </div>

        {/* Product Grid Area */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-0.5 bg-gray-200 border border-gray-200 overflow-hidden">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white">
                <ProductCard
                  product={product}
                  region={region}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-gray-50 border border-dashed border-gray-200 uppercase tracking-widest font-bold">
            <h3 className="text-lg text-gray-900 mb-2">No items match your filters</h3>
            <p className="text-gray-500 text-xs">Try adjusting your selection or clearing all filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
