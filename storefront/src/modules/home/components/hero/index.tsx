"use client"

import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const scrollToCatalogue = () => {
    const section = document.getElementById('featured-catalogue');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[100vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('/mm-home-img-desktop.webp')" }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Text */}
      <div className="relative h-full flex items-start justify-center text-center px-4 pt-[20vh] md:pt-[18vh]">
        <h1 
          className="text-white drop-shadow-2xl leading-none tracking-tighter"
          style={{ 
            fontFamily: "'Manrope', sans-serif",
            fontSize: "clamp(3.5rem, 8vw, 12rem)",
            fontWeight: 500
          }}
        >
          Elevate Your Voyage
        </h1>
      </div>

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
