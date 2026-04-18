import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  className?: string;
  isBig?: boolean;
  image?: string;
  hoverImage?: string;
  subtitle?: string;
  link?: string;
  priority?: boolean;
}

const CategoryCard = ({ title, className = '', isBig = false, image, hoverImage, subtitle, link = '/catalog', priority = false }: CategoryCardProps) => {
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
      <div className={`absolute top-6 ${isBig ? 'bottom-36' : 'bottom-20 md:bottom-28'} left-6 right-6 rounded-lg bg-[#EDEEF3]/60 backdrop-blur-[2px] border border-gray-200/50 overflow-hidden transition-all duration-500 z-10`}>
        {image ? (
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt={title}
              fill
              priority={priority}
              className={`scale-105 group-hover:scale-110 object-contain md:object-cover transition-all duration-700 ease-out mix-blend-multiply ${hoverImage ? 'group-hover:opacity-0' : ''}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${title} closeup`}
                fill
                className="object-contain md:object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105 mix-blend-multiply"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-gray-300 text-[0.6rem] md:text-xs font-semibold uppercase tracking-wider">Image Placeholder</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end items-start z-20 pointer-events-none">
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
        <div className="flex flex-wrap gap-2 pointer-events-auto relative z-40">
          <LocalizedClientLink href="/custom-studio">
            <button className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none h-9 px-3 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-[0.7rem] md:text-sm bg-white/10 backdrop-blur-sm">
              Customise
            </button>
          </LocalizedClientLink>
          <LocalizedClientLink href={link}>
            <button className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none h-9 px-3 border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-[0.7rem] md:text-sm bg-white/10 backdrop-blur-sm">
              View More
            </button>
          </LocalizedClientLink>
        </div>

        {/* Mobile arrow for small cards - keeping for visual feedback but redundant with card link */}
        {!isBig && (
          <div className="absolute bottom-3 right-3 md:hidden">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Global Card Link Overlay */}
      <LocalizedClientLink href={link} className="absolute inset-0 z-30" />
    </div>
  );
};

export default CategoryCard;
