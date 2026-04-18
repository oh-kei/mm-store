"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useProductGallery } from "./gallery-context"
import { clx } from "@medusajs/ui"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const { activeIndex, setActiveIndex } = useProductGallery()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Thumbnail dimensions based on w-20 (80px) and aspect-29/34
  const thumbnailWidth = 80
  const thumbnailHeight = Math.floor(80 * 34 / 29) // ~93.7px -> 94px
  const gap = 16 // gap-4

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollUp(scrollTop > 0)
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1)
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [images])

  const scroll = (direction: "up" | "down" | "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = thumbnailHeight + gap
      if (direction === "up") scrollContainerRef.current.scrollBy({ top: -scrollAmount, behavior: "smooth" })
      if (direction === "down") scrollContainerRef.current.scrollBy({ top: scrollAmount, behavior: "smooth" })
      if (direction === "left") scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      if (direction === "right") scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col small:flex-row gap-6 w-full max-w-[650px] mx-auto small:mx-0">
      {/* Thumbnails Container */}
      <div className="relative order-2 small:order-1 flex small:flex-col items-center small:py-8">
        {/* Desktop Arrows */}
        {canScrollUp && (
          <button 
            onClick={() => scroll("up")}
            className="hidden small:flex absolute top-0 z-20 p-1.5 bg-white shadow-md rounded-full border border-gray-100 hover:bg-gray-50 transition-all duration-200 -translate-y-1/2"
            aria-label="Scroll up"
          >
            <ChevronUp size={16} className="text-maritime-navy" />
          </button>
        )}
        
        {/* Mobile Arrows */}
        {canScrollLeft && (
          <button 
            onClick={() => scroll("left")}
            className="flex small:hidden absolute -left-4 z-10 p-1 bg-white/90 rounded-full shadow-md hover:bg-maritime-navy hover:text-white transition-all duration-200 self-center"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex small:flex-col gap-4 overflow-auto scrollbar-hide w-full py-1 px-1"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            // Max height ensures we don't cut off images vertically on desktop
            // Fits exactly 5 images: 5 * (80 * 34 / 29) + 4 * 16 ≈ 533px
            maxHeight: '533px' 
          }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={clx(
                "relative flex-shrink-0 aspect-[29/34] w-20 transition-all duration-300 rounded-lg overflow-hidden group",
                {
                  "opacity-100 ring-2 ring-maritime-navy shadow-sm": index === activeIndex,
                  "opacity-50 hover:opacity-100": index !== activeIndex,
                }
              )}
            >
              <Image
                src={image.url || ""}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>

        {canScrollDown && (
          <button 
            onClick={() => scroll("down")}
            className="hidden small:flex absolute bottom-0 z-20 p-1.5 bg-white shadow-md rounded-full border border-gray-100 hover:bg-gray-50 transition-all duration-200 translate-y-1/2"
            aria-label="Scroll down"
          >
            <ChevronDown size={16} className="text-maritime-navy" />
          </button>
        )}

        {canScrollRight && (
          <button 
            onClick={() => scroll("right")}
            className="flex small:hidden absolute -right-4 z-10 p-1 bg-white/90 rounded-full shadow-md hover:bg-maritime-navy hover:text-white transition-all duration-200 self-center"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Main Image Container */}
      <div className="flex-1 order-1 small:order-2 max-w-[500px]">
        <Container className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle rounded-2xl shadow-2xl border border-gray-100">
          {images[activeIndex] && (
            <Image
              src={images[activeIndex].url || ""}
              priority
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              alt="Main product image"
              fill
              sizes="(max-width: 576px) 100vw, (max-width: 768px) 100vw, (max-width: 992px) 60vw, 800px"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </Container>
      </div>
    </div>
  )
}

export default ImageGallery
