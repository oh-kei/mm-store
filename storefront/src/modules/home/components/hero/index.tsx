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
          className="object-cover object-[48.5%_center] md:object-center"
          priority 
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

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
