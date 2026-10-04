"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProjectImageGalleryProps {
  images: string[];
  title: string;
  coverImage?: string;
}

export default function ProjectImageGallery({
  images,
  title,
  coverImage,
}: ProjectImageGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const currentImages =
    images && images.length > 0
      ? images
      : [coverImage || "/images/preview-rpl.jpg"];

  return (
    <section className="mx-auto max-w-7xl px-6 mb-12">
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-ink-200 bg-ink-900 shadow-lg">
        <Image
          src={
            currentImages[activeImageIndex] ||
            coverImage ||
            "/images/preview-rpl.jpg"
          }
          alt={`${title} - Gambar ${activeImageIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </div>

      {/* Thumbnails switcher */}
      {currentImages.length > 1 && (
        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
          {currentImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                activeImageIndex === idx
                  ? "border-[#8B1A2F] ring-2 ring-[#8B1A2F]/30"
                  : "border-ink-200 opacity-60 hover:opacity-100"
              }`}
              aria-label={`Pilih gambar ${idx + 1}`}
            >
              <Image
                src={img}
                alt="Thumbnail"
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
