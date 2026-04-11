import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  className?: string;
  isBig?: boolean;
  image?: string;
  hoverImage?: string;
  subtitle?: string;
}

const CategoryCard = ({ title, className = '', isBig = false, image, hoverImage, subtitle }: CategoryCardProps) => {
  // If className has a height defined, we use it, otherwise default to slightly taller baseline
  const heightBase = isBig ? 'h-[500px] md:h-full' : 'h-[300px]';
  const finalClass = className.includes('h-') ? className : `${heightBase} ${className}`;

  return (
    <div className={`relative group overflow-hidden rounded-xl bg-[#EDEEF3] border border-gray-200/60 shadow-sm transition-all duration-500 hover:shadow-md ${finalClass}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#EDEEF3] transition-colors duration-500 group-hover:bg-[#E2E4EB]" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/[0.04] transition-colors duration-300 z-0" />
      
      {/* Image Container (Inner Box) */}
      <div className={`absolute top-4 ${isBig ? 'bottom-36' : 'bottom-16 md:bottom-28'} left-4 right-4 rounded-lg bg-[#EDEEF3]/60 backdrop-blur-[2px] border border-gray-200/50 overflow-hidden transition-all duration-500 z-10`}>
        {image ? (
          <>
            <div 
              className={`absolute inset-0 bg-contain bg-center bg-no-repeat md:bg-cover transition-all duration-700 ease-out ${hoverImage ? 'group-hover:opacity-0 group-hover:scale-110' : 'group-hover:scale-105'}`}
              style={{ backgroundImage: `url('${image}')` }}
            />
            {hoverImage && (
              <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat md:bg-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${hoverImage}')` }}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-gray-300 text-[0.6rem] md:text-xs font-semibold uppercase tracking-wider">Image Placeholder</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end items-start z-20">
        <div className="mb-4">
          <h3 className={`text-gray-900 font-bold ${isBig ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`} style={{ fontFamily: "'Manrope', sans-serif" }}>
            {title}
          </h3>
          {subtitle && (
            <div className="mt-1">
              <span className="text-[0.6rem] md:text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-[#000080]">
                {subtitle}
              </span>
            </div>
          )}
        </div>
        <div className={`flex flex-wrap gap-2 ${!isBig ? 'hidden md:flex' : ''}`}>
          <button className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none h-9 px-3 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-[0.7rem] md:text-sm">
            Customise
          </button>
          <button className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none h-9 px-3 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-[0.7rem] md:text-sm">
            View More
          </button>
        </div>

        {/* Mobile arrow for small cards */}
        {!isBig && (
          <div className="absolute bottom-3 right-3 md:hidden">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
