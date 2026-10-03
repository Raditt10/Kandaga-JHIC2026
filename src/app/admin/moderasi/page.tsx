"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { projectShowcases } from "@/lib/adminData"
import {
  Search,
  Filter,
  Heart,
  X,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

const ITEMS_PER_SLIDE = 6

export default function AdminModerasiPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentSlide, setCurrentSlide] = useState(0)

  // Filtered and sorted projects (sorted by uploadOrder / earliest upload)
  const filteredProjects = projectShowcases
    .filter((proj) => {
      const matchCategory =
        categoryFilter === "all"
          ? true
          : proj.category.toLowerCase().includes(categoryFilter.toLowerCase())
      const matchSearch =
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.authorRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
    .sort((a, b) => (a.uploadOrder ?? 0) - (b.uploadOrder ?? 0))

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_SLIDE)
  const safeSlide = Math.min(currentSlide, Math.max(0, totalPages - 1))
  const displayedProjects = filteredProjects.slice(
    safeSlide * ITEMS_PER_SLIDE,
    (safeSlide + 1) * ITEMS_PER_SLIDE
  )

  const startItem = filteredProjects.length === 0 ? 0 : safeSlide * ITEMS_PER_SLIDE + 1
  const endItem = Math.min(filteredProjects.length, (safeSlide + 1) * ITEMS_PER_SLIDE)

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentSlide(0)
  }

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val)
    setCurrentSlide(0)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header & Filter Controls Bar */}
        <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary" />
              <span>Kurasi Karya & Moderasi Galeri</span>
            </h1>
            <p className="text-xs text-ink-600 mt-0.5">
              Daftar karya inovasi dan portofolio siswa Kandaga ({filteredProjects.length} karya). Hover kartu untuk melihat detail di halaman kurasi.
            </p>
          </div>

          {/* Filtering & Search Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari karya / siswa..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-ink-150 text-xs bg-ink-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Kategori / Jurusan */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-ink-300" />
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-ink-150 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer font-medium"
              >
                <option value="all">Semua Kategori</option>
                <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
                <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
                <option value="Analis Kimia">Analis Kimia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs">
            <p className="text-xs text-ink-300">Tidak ada karya yang sesuai dengan filter atau kata kunci.</p>
            <button
              type="button"
              onClick={() => {
                handleSearchChange("")
                handleCategoryChange("all")
              }}
              className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div
            key={safeSlide}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in-50 slide-in-from-right-4 duration-300"
          >
            {displayedProjects.map((proj) => (
              <div
                key={proj.id}
                className="relative group p-4 rounded-2xl bg-white border border-ink-150 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Dark Overlay saat Hover dengan Icon Mata untuk Menuju Halaman Detail (Tanpa tombol verifikasi/tolak di card) */}
                <Link
                  href={`/admin/moderasi/${proj.id}`}
                  className="absolute inset-0 bg-ink/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-4 text-center cursor-pointer no-underline"
                >
                  <div className="w-13 h-13 rounded-full bg-white/20 hover:bg-white text-white hover:text-ink flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-200 transform scale-90 group-hover:scale-100 hover:scale-110 mb-2">
                    <Eye className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide drop-shadow-sm hover:underline">
                    Lihat Detail Karya
                  </span>
                </Link>

                <div>
                  {/* Image Area */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-ink-100 mb-3">
                    <Image
                      src={proj.image}
                      alt={proj.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Kategori di Kanan Atas Gambar */}
                    <span className="absolute top-2.5 right-2.5 z-10 bg-ink/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                      {proj.category}
                    </span>
                  </div>

                  <h2 className="font-bold text-sm text-ink group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {proj.title}
                  </h2>
                  <p className="text-xs text-ink-600 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-ink-150 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center shrink-0">
                      {proj.author.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-semibold text-ink text-xs block leading-tight">
                        {proj.author}
                      </span>
                      <span className="text-[10px] text-ink-300 block">
                        {proj.authorRole}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-ink-600 font-medium text-xs shrink-0">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{proj.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Slide Pagination Bar (Jika > 6 karya) */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-ink-150 shadow-xs text-xs text-ink-600">
            {/* Pagination Controls di sebelah Kiri */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeSlide === 0}
                onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-xl border border-ink-150 bg-white flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Slide Sebelumnya"
                aria-label="Slide Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      safeSlide === idx
                        ? "bg-primary text-white shadow-xs"
                        : "bg-ink-100 text-ink-600 hover:bg-ink-100 border border-ink-150"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={safeSlide === totalPages - 1}
                onClick={() => setCurrentSlide((prev) => Math.min(totalPages - 1, prev + 1))}
                className="w-8 h-8 rounded-xl border border-ink-150 bg-white flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                title="Slide Berikutnya"
                aria-label="Slide Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Info Jumlah & Slide di sebelah Kanan */}
            <div className="flex items-center gap-2">
              <span>Menampilkan karya</span>
              <span className="font-bold text-ink">
                {startItem}–{endItem}
              </span>
              <span>dari</span>
              <span className="font-bold text-ink">{filteredProjects.length}</span>
              <span className="text-ink-300">|</span>
              <span className="px-2 py-0.5 rounded-full bg-ink-100 text-ink-700 font-semibold text-[11px]">
                Slide {safeSlide + 1} dari {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
