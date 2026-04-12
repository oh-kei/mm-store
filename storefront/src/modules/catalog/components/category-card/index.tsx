import React from 'react';
import LocalizedClientLink from "@modules/common/components/localized-client-link";

interface CategoryCardProps {
  name: string;
  handle: string;
  image: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, handle, image }) => {
  return (
    <div className="group h-full flex flex-col transition-all duration-300 border-none rounded-none shadow-none hover:bg-gray-50/30">
      {/* Image Container with Custom #EDEEF3 Background */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EDEEF3] p-6 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
      </div>

      <div className="space-y-3 p-5 flex-grow flex flex-col">
        <div className="flex-grow space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-maritime-navy/40 font-black">
            Category
          </p>
          <h3 className="font-bold text-xs text-gray-900 group-hover:text-maritime-navy transition-colors tracking-tight uppercase font-sans">
            {name}
          </h3>
          <div className="flex items-center gap-2 pt-2">
            <div className="w-4.5 h-4.5 rounded-full bg-gray-200 border border-black/10 shadow-sm" />
            <div className="w-4.5 h-4.5 rounded-full bg-gray-400 border border-black/10 shadow-sm" />
          </div>
        </div>

        {/* Permanent Action Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-4">
          <LocalizedClientLink href={`/catalog?category=${handle}`} className="w-full">
            <button 
              className="w-full h-9 text-[10px] uppercase tracking-widest font-bold border border-gray-200 text-gray-900 hover:bg-maritime-navy hover:text-white hover:border-maritime-navy transition-all duration-300 rounded-none px-0"
            >
              Explore Collection
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  );
};
