import React from 'react';
import CategoryCard from '../category-card';
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FeaturedCatalogue = () => {
  return (
    <div className="bg-gray-50/50 border-t border-gray-100">
      <section id="featured-catalogue" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Featured Items
            </h2>
            <p className="text-slate-500 font-medium max-w-xl">
              Discover our most popular maritime gear, from technical sailing jackets to high-performance base layers.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Item - Full width on mobile, left column on desktop */}
          <div className="md:col-span-1">
            <CategoryCard 
              title="Inshore Sailing Jacket" 
              isBig={true} 
              image="/mariners-jacket.webp" 
              hoverImage="/mm-jacket-closeup.webp"
              subtitle="MOST POPULAR"
              link="/products/inshore-sailing-jacket"
              priority={true}
            />
          </div>

          {/* Two columns: 2x2 on mobile, staggered on desktop */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
            {/* Column 1: Shirts & Decorations */}
            <div className="flex flex-col gap-4 md:gap-6">
              <CategoryCard 
                title="Short Sleeve T-shirt" 
                className="h-[160px] md:h-[360px]" 
                image="/mm-tshirt.png"
                hoverImage="/mm-polo-closeup-navy.webp"
                link="/products/short-sleeve-t-shirt"
              />
              <CategoryCard 
                title="Regatta Banner" 
                className="h-[160px] md:h-[240px]" 
                image="/mm-regatta-banner.webp"
                hoverImage="/mm-regatta-closeup.webp"
                link="/products/regatta-banner"
              />
            </div>
            {/* Column 2: Duffel Bags & Accessories */}
            <div className="flex flex-col gap-4 md:gap-6">
              <CategoryCard 
                title="Rashguard" 
                className="h-[160px] md:h-[300px]" 
                image="/mm-rashguard.png"
                hoverImage="/mm-navyduffel-closeup.webp"
                link="/products/rashguard"
              />
              <CategoryCard 
                title="Compression Polo" 
                className="h-[160px] md:h-[300px]" 
                image="/mariners-market-polo.webp"
                hoverImage="/mm-hats-closeup-black.webp"
                link="/products/compression-polo"
              />
            </div>
          </div>
        </div>

        {/* Explore All Button */}
        <div className="mt-16 flex justify-center">
          <LocalizedClientLink 
            href="/catalog" 
            className="group flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/10"
          >
            Explore our full catalogue
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-maritime-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  );
};

export default FeaturedCatalogue;

