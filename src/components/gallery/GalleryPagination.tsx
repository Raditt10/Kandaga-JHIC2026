"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function GalleryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GalleryPaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      if (typeof window !== "undefined") {
        const el = document.getElementById("katalog-karya");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-14 pt-8 border-t border-ink-150 flex flex-col sm:flex-row items-center justify-between gap-4"
      aria-label="Navigasi Halaman Galeri"
    >
      {/* Page indicator info */}
      <p className="text-xs sm:text-sm font-medium text-ink-600">
        Halaman <span className="font-bold text-ink">{currentPage}</span> dari{" "}
        <span className="font-bold text-ink">{totalPages}</span>
      </p>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-full border border-ink-200 text-ink-700 transition-colors ${
            currentPage === 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-ink-100 hover:text-ink cursor-pointer"
          }`}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Number Buttons */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              className={`min-w-10 h-10 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#8B1A2F] text-white shadow-xs"
                  : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-100 hover:text-ink"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Buka halaman ${p}`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-full border border-ink-200 text-ink-700 transition-colors ${
            currentPage === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-ink-100 hover:text-ink cursor-pointer"
          }`}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
