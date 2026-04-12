"use client"

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '../components/product-card';
import { CategoryCard } from '../components/category-card';
import { FilterDropdown } from '../components/filter-dropdown';
import { HttpTypes } from "@medusajs/types";

const CATEGORIES = [
  { name: "All", handle: "all", image: "/mm-home-img-desktop.webp" },
  { name: "Bags", handle: "bags", image: "/mm-duffel-navy.webp" },
  { name: "Tops", handle: "tops", image: "/mariners-market-polo.webp" },
  { name: "Hats", handle: "hats", image: "/mm-hats-blackwhite.webp" },
  { name: "Jackets", handle: "jackets", image: "/mariners-jacket.webp" },
  { name: "Event Items", handle: "event-items", image: "/mm-regatta-banner.webp" },
]

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
  const selectedCategory = searchParams.get('category');
  const typeFilter = selectedCategory || 'All';
  const sizeFilter = searchParams.get('size') || 'All';
  const colorFilter = searchParams.get('color') || 'All';
  const genderFilter = searchParams.get('gender') || 'All';

  const showCategoryLanding = !selectedCategory;

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      // 1. Type/Category Filter
      if (typeFilter !== 'All' && typeFilter !== 'all') {
        const targetType = typeFilter.toLowerCase().trim();
        
        // Check Product Type
        const productType = product.type?.value?.toLowerCase().trim();
        if (productType === targetType) return true;

        // Check Product Categories
        const hasCategoryMatch = product.categories?.some((cat: any) => 
          cat.name?.toLowerCase().trim() === targetType || 
          cat.handle?.toLowerCase().trim() === targetType
        );
        if (hasCategoryMatch) return true;

        // Check Product Collection
        if (product.collection?.title?.toLowerCase().trim() === targetType || 
            product.collection?.handle?.toLowerCase().trim() === targetType) {
          return true;
        }
        
        // Handle "Event Items" mapping
        const eventItemsAliases = ['event-items', 'banners/event items', 'banners-event-items', 'event items'];
        if (eventItemsAliases.includes(targetType)) {
             const isEventItem = eventItemsAliases.includes(productType || '') || 
                                product.categories?.some((cat: any) => eventItemsAliases.includes(cat.name?.toLowerCase().trim() || ''));
             if (isEventItem) return true;
        }

        return false;
      }

      // 2. Attribute Filters (Size, Color, Gender)
      const matchOption = (title: string, value: string) => {
        if (value === 'All') return true;
        return product.variants?.some((v: any) => 
          v.options?.some((vo: any) => {
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
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-8">
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

        {/* Content Area */}
        {showCategoryLanding ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-0.5 bg-gray-200 border border-gray-200 overflow-hidden">
            {CATEGORIES.map((cat) => (
              <div key={cat.handle} className="bg-white">
                 <CategoryCard name={cat.name} handle={cat.handle} image={cat.image} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
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
