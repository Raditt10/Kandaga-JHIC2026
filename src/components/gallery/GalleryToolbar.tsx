"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

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
  const majorOptions = [
    { value: "semua",        label: "Semua Kategori" },
    { value: "rpl",          label: "RPL (Rekayasa Perangkat Lunak)" },
    { value: "tkj",          label: "TKJ (Teknik Komputer Jaringan)" },
    { value: "analis-kimia", label: "Analis Kimia" },
  ] as const;

  const sortOptions = [
    { value: "terbaru",   label: "Terbaru (2025–2024)" },
    { value: "populer",   label: "Terpopuler (Paling Dilihat)" },
    { value: "unggulan",  label: "Kurasi Unggulan Sekolah" },
  ] as const;

  return (
    <div className="space-y-3">
      {/* ── Top Bar: Search kiri, Filter + Sort di kanan ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search — kiri */}
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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

        {/* Filter + Sort — kanan */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <FilterDropdown
            value={selectedMajor}
            onChange={onSelectMajor}
            options={majorOptions as unknown as Array<{ value: FilterMajor; label: string }>}
            align="right"
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <FilterDropdown
            value={sortBy}
            onChange={onSortChange}
            options={sortOptions as unknown as Array<{ value: SortOption; label: string }>}
            icon={null}
            align="right"
          />
        </div>
      </div>

      {/* ── Total count ── */}
      <div className="flex items-center border-t border-ink-150 pt-3">
        <p className="text-xs sm:text-sm font-medium text-ink-600">
          Menampilkan <span className="font-bold text-ink">{totalResults}</span> karya terkurasi
        </p>
      </div>
    </div>
  );
}
