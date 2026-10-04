"use client"

import React, { useState } from "react"
import Image from "next/image"

interface GalleryImageViewerProps {
  images: string[]
  title: string
}

export default function GalleryImageViewer({ images, title }: GalleryImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const src = images[activeIndex] ?? images[0] ?? "/images/preview-rpl.jpg"

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-ink-200 bg-ink-900 shadow-lg">
        <Image
          src={src}
          alt={`${title} - Gambar ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                activeIndex === idx
                  ? "border-[#8B1A2F] ring-2 ring-[#8B1A2F]/30"
                  : "border-ink-200 opacity-60 hover:opacity-100"
              }`}
              aria-label={`Pilih gambar ${idx + 1}`}
              aria-current={activeIndex === idx ? "true" : undefined}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
