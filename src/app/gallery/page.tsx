"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectCard from "@/components/gallery/ProjectCard";
import GalleryToolbar, {
  FilterMajor,
  SortOption,
} from "@/components/gallery/GalleryToolbar";
import GalleryPagination from "@/components/gallery/GalleryPagination";
import type { GalleryProjectItem } from "@/types";
import { Sparkles, Layers, ShieldCheck, SearchX, Loader2, AlertCircle, RefreshCw } from "lucide-react";

function getInitialFilters(): {
  page: number;
  major: FilterMajor;
  q: string;
  sort: SortOption;
} {
  if (typeof window === "undefined") {
    return { page: 1, major: "semua", q: "", sort: "terbaru" };
  }
  const url = new URL(window.location.href);
  const pageParam = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const rawMajor = (url.searchParams.get("major") || url.searchParams.get("jurusan") || "semua").toLowerCase();
  const majorParam: FilterMajor =
    rawMajor === "rpl" || rawMajor === "tkj" || rawMajor === "analis-kimia"
      ? rawMajor
      : "semua";
  const qParam = url.searchParams.get("q") || "";
  const rawSort = (url.searchParams.get("sort") || "terbaru").toLowerCase();
  const sortParam: SortOption =
    rawSort === "populer" || rawSort === "unggulan" ? rawSort : "terbaru";

  return { page: pageParam, major: majorParam, q: qParam, sort: sortParam };
}

export default function GalleryPage() {
  const [selectedMajor, setSelectedMajor] = useState<FilterMajor>(() => getInitialFilters().major);
  const [searchQuery, setSearchQuery] = useState<string>(() => getInitialFilters().q);
  const [sortBy, setSortBy] = useState<SortOption>(() => getInitialFilters().sort);
  const [currentPage, setCurrentPage] = useState<number>(() => getInitialFilters().page);

  const [projects, setProjects] = useState<GalleryProjectItem[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPopStateRef = useRef(false);
  const isFirstMountRef = useRef(true);

  // Fetch paginated & filtered data from Backend API (cached via Redis)
  const fetchProjects = useCallback(
    async (page: number, major: FilterMajor, query: string, sort: SortOption) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setErrorMsg(null);

      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "12");
        if (major !== "semua") params.set("major", major);
        if (query.trim()) params.set("q", query.trim());
        if (sort !== "terbaru") params.set("sort", sort);

        const res = await fetch(`/api/gallery?${params.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.projects)) {
            setProjects(data.projects);
            if (data.pagination) {
              setTotalResults(data.pagination.total);
              setTotalPages(data.pagination.totalPages);
            }
          }
        } else {
          setErrorMsg("Gagal memuat katalog karya dari server.");
        }

        // Sync URL query params without triggering full page reload
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams();
          if (page > 1) urlParams.set("page", page.toString());
          if (major !== "semua") urlParams.set("major", major);
          if (query.trim()) urlParams.set("q", query.trim());
          if (sort !== "terbaru") urlParams.set("sort", sort);

          const newUrl =
            urlParams.toString().length > 0
              ? `${window.location.pathname}?${urlParams.toString()}`
              : window.location.pathname;
          window.history.replaceState(null, "", newUrl);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch gallery projects from API:", err);
        setErrorMsg("Koneksi terputus saat mengambil data karya.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Support browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const initial = getInitialFilters();
      isPopStateRef.current = true;
      setSelectedMajor(initial.major);
      setSearchQuery(initial.q);
      setSortBy(initial.sort);
      setCurrentPage(initial.page);
      fetchProjects(initial.page, initial.major, initial.q, initial.sort);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProjects]);

  // Combined fetch handler: instant on mount, debounced on subsequent filter/search/sort/page changes
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      fetchProjects(currentPage, selectedMajor, searchQuery, sortBy);
      return;
    }

    const timer = setTimeout(() => {
      fetchProjects(currentPage, selectedMajor, searchQuery, sortBy);
    }, 250);

    return () => clearTimeout(timer);
  }, [currentPage, selectedMajor, searchQuery, sortBy, fetchProjects]);

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
            totalResults={totalResults}
          />

          {/* Project Cards Grid with Layout-Stable Loading State */}
          <div className="relative mt-8 min-h-[300px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-3xl transition-opacity">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-ink-150 shadow-md text-xs font-semibold text-ink-700">
                  <Loader2 className="w-4 h-4 animate-spin text-[#8B1A2F]" />
                  <span>Memuat karya...</span>
                </div>
              </div>
            )}

            {errorMsg && !isLoading ? (
              /* Error State */
              <div className="p-12 rounded-3xl border-2 border-dashed border-red-200 bg-red-50/50 text-center max-w-xl mx-auto flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-red-200 flex items-center justify-center text-red-500 mb-4 shadow-xs">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">
                  Gagal Memuat Karya
                </h3>
                <p className="mt-2 text-sm text-ink-600 max-w-md leading-relaxed">
                  {errorMsg}
                </p>
                <button
                  type="button"
                  onClick={() => fetchProjects(currentPage, selectedMajor, searchQuery, sortBy)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1A2F] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#6B1424] transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Coba Lagi</span>
                </button>
              </div>
            ) : !isLoading && projects.length === 0 ? (
              /* Empty State */
              <div className="p-12 rounded-3xl border-2 border-dashed border-ink-200 bg-[#FBF9F6] text-center max-w-xl mx-auto flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-ink-200 flex items-center justify-center text-ink-400 mb-4 shadow-xs">
                  <SearchX className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-bold text-ink">
                  Karya Tidak Ditemukan
                </h3>
                <p className="mt-2 text-sm text-ink-600 max-w-md leading-relaxed">
                  Tidak ada karya yang cocok dengan kriteria pencarian &ldquo;{searchQuery}&rdquo; pada kategori yang dipilih. Cobalah kata kunci lain atau setel ulang filter.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 px-5 py-2.5 bg-[#8B1A2F] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#6B1424] transition-colors cursor-pointer shadow-xs"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-opacity duration-200 ${
                  isLoading ? "opacity-50" : "opacity-100"
                }`}
              >
                {projects.map((project: GalleryProjectItem) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <GalleryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
