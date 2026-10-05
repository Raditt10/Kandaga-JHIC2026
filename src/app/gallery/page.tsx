"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectCard from "@/components/gallery/ProjectCard";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import GalleryToolbar, { FilterMajor, SortOption } from "@/components/gallery/GalleryToolbar";
import GalleryPagination from "@/components/gallery/GalleryPagination";
import type { GalleryProjectItem } from "@/data/galleryData";
import { Sparkles, Layers, ShieldCheck, SearchX } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function GalleryPage() {
  const [selectedMajor, setSelectedMajor] = useState<FilterMajor>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [projects, setProjects] = useState<GalleryProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Menerima kata kunci dari kotak pencarian dashboard lewat /gallery?q=...
  // Dibaca dari window (bukan useSearchParams) supaya halaman ini tidak
  // memerlukan Suspense boundary saat dirender statis.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearchQuery(q);
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } else {
        console.error("Gagal memuat galeri:", res.status);
        setProjects([]);
      }
    } catch (error) {
      console.error("Gagal memuat galeri:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter & Search Logic
  const filteredProjects = useMemo(() => {
    let list = [...projects];

    // Filter by department (supports both major and jurusan fields)
    if (selectedMajor !== "semua") {
      list = list.filter((p) => p.major === selectedMajor || p.jurusan === selectedMajor);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.studentName?.toLowerCase().includes(q) ||
          (p.tools && p.tools.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort order
    if (sortBy === "populer") {
      list.sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
    } else if (sortBy === "unggulan") {
      list.sort((a, b) => {
        if (a.status === "featured" && b.status !== "featured") return -1;
        if (a.status !== "featured" && b.status === "featured") return 1;
        return (b.year || 0) - (a.year || 0);
      });
    } else {
      // Default: Terbaru
      list.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    return list;
  }, [projects, selectedMajor, searchQuery, sortBy]);

  // Reset to page 1 on filter or search changes
  const handleSelectMajor = (major: FilterMajor) => {
    setSelectedMajor(major);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleResetFilters = () => {
    setSelectedMajor("semua");
    setSearchQuery("");
    setSortBy("terbaru");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── Hero / Page Header ── */}
        <section className="border-b border-ink-150 bg-gradient-to-b from-[#FBF9F6] to-white pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1A2F]/10 border border-[#8B1A2F]/20 text-[#8B1A2F] text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KATALOG RESMI SMKN 13 BANDUNG</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink">
              Etalase Karya Siswa
            </h1>

            <p className="mt-4 text-base text-ink-700 leading-relaxed max-w-[65ch]">
              Jelajahi karya inovasi perangkat lunak, infrastruktur jaringan, dan riset laboratorium sains terapan. Seluruh karya telah melalui proses bimbingan dan kurasi resmi guru SMKN 13 Bandung.
            </p>

            {/* Credibility highlights */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-ink-600 border-t border-ink-150/70 pt-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">100% Terverifikasi Guru Pembimbing</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8B1A2F] shrink-0" />
                <span className="font-medium">3 Program Keahlian: RPL &bull; TKJ &bull; Analis Kimia</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Catalog Section ── */}
        <section id="katalog-karya" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-28">
          <h2 className="sr-only">Daftar Karya Proyek Siswa</h2>

          {/* Interactive Toolbar */}
          <GalleryToolbar
            selectedMajor={selectedMajor}
            onSelectMajor={handleSelectMajor}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            totalResults={isLoading ? 0 : filteredProjects.length}
          />

          {isLoading ? (
            <Loading />
          ) : (
            <>
              {/* Project Cards Grid */}
              {paginatedProjects.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {paginatedProjects.map((project: GalleryProjectItem) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <EmptyState
                  className="mt-12"
                  icon={<SearchX className="w-8 h-8" />}
                  title="Karya Tidak Ditemukan"
                  description={`Tidak ada karya yang cocok dengan kata kunci “${searchQuery}” pada kategori yang dipilih. Cobalah kata kunci lain atau setel ulang filter.`}
                  action={{ label: "Reset Semua Filter", onClick: handleResetFilters }}
                />
              )}

              {/* Pagination */}
              <GalleryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
