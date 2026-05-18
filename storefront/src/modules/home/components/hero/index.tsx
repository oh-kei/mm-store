"use client"

import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const scrollToCatalogue = () => {
    const section = document.getElementById('featured-catalogue');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[100vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 scale-105">
        <Image 
          src="/banner.webp" 
          alt="Banner" 
          fill 
          /* OPACITY CONFIGURATION: 
             To change the background image's own opacity, add Tailwind classes like 
             "opacity-90", "opacity-80", or custom styles like "style={{ opacity: 0.85 }}". 
          */
          className="object-cover object-[48.5%_center] md:object-center transition-opacity duration-300"
          priority 
        />
      </div>
      
      {/* Overlay Opacity Layer */}
      {/* OPACITY CONFIGURATION:
         Change "bg-black/40" to higher values (e.g. "bg-black/50" or "bg-black/60") to make the 
         image darker and increase text contrast, or lower values (e.g. "bg-black/20") to make it brighter.
      */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Scroll Indicator (Semi-circle with Arrow) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={scrollToCatalogue}
          className="group relative flex items-center justify-center"
        >
          {/* Semi-circle background */}
          <div className="w-20 h-10 bg-white rounded-t-full shadow-lg flex items-center justify-center">
            <ChevronDown className="w-6 h-6 text-gray-800 mt-1" />
          </div>
        </button>
      </div>
    </section>
  );
};

export default Hero;
