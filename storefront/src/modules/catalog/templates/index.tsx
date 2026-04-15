"use client"

import React, { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '../components/product-card';
import { CategoryCard } from '../components/category-card';
import { HttpTypes } from "@medusajs/types";
import Breadcrumbs from '@modules/common/components/breadcrumbs';

const CATEGORIES = [
  { name: "All", handle: "all", image: "/mm-home-img-desktop.webp" },
  { name: "Tops", handle: "tops", image: "/mariners-market-polo.webp" },
  { name: "Jackets", handle: "jackets", image: "/mariners-jacket.webp" },
  { name: "Hats", handle: "hats", image: "/mm-hats-blackwhite.webp" },
  { name: "Event Items", handle: "event-items", image: "/mm-regatta-banner.webp" },
  { name: "Bags", handle: "bags", image: "/mm-duffel-navy.webp" },
]

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

  const showCategoryLanding = !selectedCategory;

  const breadcrumbItems = useMemo(() => {
    const items = [{ name: "Catalog", handle: "catalog" }];
    if (selectedCategory) {
      const category = CATEGORIES.find(c => c.handle === selectedCategory);
      items.push({ name: category?.name || selectedCategory, handle: `catalog?category=${selectedCategory}` });
    }
    return items;
  }, [selectedCategory]);

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

      return true;
    });
  }, [products, typeFilter]);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        <Breadcrumbs items={breadcrumbItems} />

        {/* Content Area */}
        {showCategoryLanding ? (
          /* GRID CONFIGURATION: gap-[2px] defines the thin white line between boxes. bg-white provides the line color. */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-[4px] bg-white border border-white overflow-hidden">
            {CATEGORIES.map((cat) => (
              <div key={cat.handle} className="bg-white">
                 <CategoryCard name={cat.name} handle={cat.handle} image={cat.image} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* GRID CONFIGURATION: gap-[2px] defines the thin white line between boxes. bg-white provides the line color. */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-[4px] bg-white border border-white overflow-hidden">
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
            <button 
              onClick={() => router.push(pathname)}
              className="mt-4 text-[10px] uppercase tracking-widest font-bold text-maritime-navy hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
