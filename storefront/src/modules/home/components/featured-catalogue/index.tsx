import React from 'react';
import CategoryCard from '../category-card';

const FeaturedCatalogue = () => {
  return (
    <div className="bg-gray-50/50 border-t border-gray-100">
      <section id="featured-catalogue" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Featured Catalogue
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Item - Full width on mobile, left column on desktop */}
          <div className="md:col-span-1">
            <CategoryCard 
              title="Offshore Jackets" 
              isBig={true} 
              image="/mariners-jacket.webp" 
              hoverImage="/mm-jacket-closeup.webp"
              subtitle="MOST POPULAR"
            />
          </div>

          {/* Two columns: 2x2 on mobile, staggered on desktop */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
            {/* Column 1: Shirts & Decorations */}
            <div className="flex flex-col gap-4 md:gap-6">
              <CategoryCard 
                title="Shirts" 
                className="h-[160px] md:h-[360px]" 
                image="/mariners-market-polo.webp"
                hoverImage="/mm-polo-closeup-navy.webp"
              />
              <CategoryCard 
                title="Decorations" 
                className="h-[160px] md:h-[240px]" 
                image="/mm-regatta-banner.webp"
                hoverImage="/mm-regatta-closeup.webp"
              />
            </div>
            {/* Column 2: Duffel Bags & Accessories */}
            <div className="flex flex-col gap-4 md:gap-6">
              <CategoryCard 
                title="Duffel Bags" 
                className="h-[160px] md:h-[300px]" 
                image="/mm-duffel-navy.webp"
                hoverImage="/mm-navyduffel-closeup.webp"
              />
              <CategoryCard 
                title="Accessories" 
                className="h-[160px] md:h-[300px]" 
                image="/mm-hats-blackwhite.webp"
                hoverImage="/mm-hats-closeup-black.webp"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturedCatalogue;
