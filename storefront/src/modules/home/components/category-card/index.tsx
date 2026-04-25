"use client";

import React, { useState, useEffect, useRef } from "react";
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
  imagePadding?: string;
  isImageBig?: boolean;
}

const CategoryCard = ({ title, className = '', isBig = false, image, hoverImage, subtitle, link = '/catalog', priority = false, imagePadding = 'p-0', isImageBig = false }: CategoryCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger scroll reveal on mobile
        if (window.innerWidth < 768) {
          setIsRevealed(entry.isIntersecting);
        } else {
          setIsRevealed(false);
        }
      },
      {
        threshold: 0.7, // Trigger when 70% visible
        rootMargin: '-5% 0px -5% 0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // If className has a height defined, we use it, otherwise default to slightly taller baseline
  const heightBase = isBig ? 'h-[500px] md:h-full' : 'h-[300px]';
  const finalClass = className.includes('h-') ? className : `${heightBase} ${className}`;

  return (
    <div 
      ref={cardRef}
      className={`relative group overflow-hidden rounded-xl bg-[#EDEEF3] border border-gray-200/60 shadow-sm transition-all duration-500 hover:shadow-md ${finalClass}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Global Card Link Overlay */}
      <LocalizedClientLink href={link} className="absolute inset-0 z-10" />
      
      {/* Background */}
      <div className={`absolute inset-0 transition-colors duration-500 ${isRevealed ? 'bg-[#E2E4EB]' : 'bg-[#EDEEF3] group-hover:bg-[#E2E4EB]'}`} />
      
      {/* Overlay */}
      <div className={`absolute inset-0 transition-colors duration-300 z-0 ${isRevealed ? 'bg-black/[0.04]' : 'bg-black/[0.02] group-hover:bg-black/[0.04]'}`} />
      
      {/* Image Container (Inner Box) - Fills top 75% on mobile, original inset on desktop */}
      <div className={`absolute transition-all duration-500 z-10 ${imagePadding} ${isBig ? 'top-6 left-6 right-6 bottom-36 rounded-lg border border-gray-200/50' : `top-0 md:top-6 left-0 md:left-6 right-0 md:right-6 ${isImageBig ? 'bottom-[15%] md:bottom-20' : 'bottom-[25%] md:bottom-28'} md:rounded-lg md:border md:border-gray-200/50`} bg-[#EDEEF3]/60 backdrop-blur-[2px] overflow-hidden`}>
        {image ? (
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt={title}
              fill
              priority={priority}
              className={`transition-all duration-700 ease-out mix-blend-multiply ${imagePadding === 'p-0' ? 'object-cover' : 'object-contain'} ${isRevealed ? 'opacity-0 scale-105' : 'group-hover:scale-105 group-hover:opacity-0'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${title} closeup`}
                fill
                className={`transition-all duration-700 ease-out mix-blend-multiply ${imagePadding === 'p-0' ? 'object-cover' : 'object-contain'} ${isRevealed ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-100 group-hover:scale-105'}`}
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

      {/* Content - Responsive positioning and text size */}
      <div className={`absolute inset-0 ${isBig ? 'p-4 md:p-6' : 'p-3 md:pt-4 md:px-4 md:pb-3'} flex flex-col justify-end items-start z-50 pointer-events-none`}>
        <div className={isBig ? 'mb-4' : 'mb-0.5 md:mb-1'}>
          <h3 className={`text-gray-900 font-bold ${isBig ? 'text-2xl md:text-3xl' : 'text-xs md:text-xl'} leading-tight`} style={{ fontFamily: "'Manrope', sans-serif" }}>
            {title}
          </h3>
          {subtitle && (
            <div className="mt-0.5">
              <span className={`font-extrabold uppercase tracking-[0.1em] text-[#000080] ${isBig ? 'text-[0.6rem] md:text-[0.7rem]' : 'text-[0.5rem] md:text-[0.6rem]'}`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {/* Buttons: Always show for big cards, show only on desktop for small cards */}
        <div className={`flex-wrap gap-2 pointer-events-auto relative z-50 ${isBig ? 'flex' : 'hidden md:flex'}`}>
          <LocalizedClientLink 
            href={`/custom-studio?handle=${link.split('/').pop()}`}
            className="relative z-50"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 bg-white/10 backdrop-blur-sm h-9 px-3 text-[0.7rem] md:text-sm">
              Customise
            </button>
          </LocalizedClientLink>
          <LocalizedClientLink 
            href={link}
            className="relative z-50"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button className="inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 bg-white/10 backdrop-blur-sm h-9 px-3 text-[0.7rem] md:text-sm">
              View More
            </button>
          </LocalizedClientLink>
        </div>

        {/* Mobile arrow for small cards */}
        {!isBig && (
          <div className="absolute bottom-2 right-2 md:hidden">
            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
