"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export type FilterMajor = "semua" | "rpl" | "tkj" | "analis-kimia";
export type SortOption = "terbaru" | "populer" | "unggulan";

interface GalleryToolbarProps {
  selectedMajor: FilterMajor;
  onSelectMajor: (major: FilterMajor) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
}

export default function GalleryToolbar({
  selectedMajor,
  onSelectMajor,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
}: GalleryToolbarProps) {
  const majorFilters: Array<{ id: FilterMajor; label: string }> = [
    { id: "semua", label: "Semua Jurusan" },
    { id: "rpl", label: "RPL (Software)" },
    { id: "tkj", label: "TKJ (Jaringan & IoT)" },
    { id: "analis-kimia", label: "Analis Kimia (Lab)" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Search & Sort ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search input field */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
            <Search className="w-4 h-4 text-ink-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul proyek, teknologi, atau kreator..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-ink-200 rounded-full text-sm text-ink placeholder:text-ink-400 focus:outline-hidden focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/15 transition-all shadow-xs"
            aria-label="Pencarian proyek"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-400 hover:text-ink cursor-pointer"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-600">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Urutkan:</span>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-white border border-ink-200 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-ink focus:outline-hidden focus:border-[#8B1A2F] focus:ring-2 focus:ring-[#8B1A2F]/15 cursor-pointer shadow-xs transition-colors pr-8 appearance-none"
              aria-label="Pilih urutan proyek"
            >
              <option value="terbaru">Terbaru (2025–2024)</option>
              <option value="populer">Terpopuler (Paling Dilihat)</option>
              <option value="unggulan">Kurasi Unggulan Sekolah</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-ink-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Department Filter Pills ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-150">
        <div className="flex flex-wrap items-center gap-2">
          {majorFilters.map((tab) => {
            const isActive = selectedMajor === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectMajor(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#8B1A2F] text-white shadow-sm shadow-[#8B1A2F]/25"
                    : "bg-ink-100 text-ink-700 hover:bg-ink-150 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Total count */}
        <p className="text-xs sm:text-sm font-medium text-ink-600">
          Menampilkan <span className="font-bold text-ink">{totalResults}</span> karya terkurasi
        </p>
      </div>
    </div>
  );
}
