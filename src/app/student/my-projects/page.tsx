"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Loading from "@/components/ui/Loading";
import StudentProjectCard from "@/components/student/StudentProjectCard";
import EditProjectModal from "@/components/student/EditProjectModal";
import StudentProjectDetailModal from "@/components/student/StudentProjectDetailModal";
import type { GalleryProjectItem } from "@/data/galleryData";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Plus,
  Globe,
  Lock,
  Sparkles,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

type VisibilityFilter = "all" | "public" | "private";
type SortOption = "newest" | "oldest" | "views";

export default function StudentMyProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<GalleryProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeEditProject, setActiveEditProject] = useState<GalleryProjectItem | null>(null);
  const [activeDetailProject, setActiveDetailProject] = useState<GalleryProjectItem | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/student/projects");
      if (!res.ok) {
        throw new Error("Gagal mengambil data proyek dari database");
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      console.error("Error loading student projects:", err);
      setErrorMessage("Tidak dapat memuat karya dari database. Pastikan sesi login aktif.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const handleUpdateEvent = () => {
      loadProjects();
    };

    window.addEventListener("kandaga_projects_updated", handleUpdateEvent);
    return () => {
      window.removeEventListener("kandaga_projects_updated", handleUpdateEvent);
    };
  }, []);

  // Flash toast message
  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Visibility toggle
  const handleToggleVisibility = async (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const newIsPrivate = !target.isPrivate;

    // Optimistic update in UI
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, isPrivate: newIsPrivate } : p))
    );
    if (activeDetailProject && activeDetailProject.id === projectId) {
      setActiveDetailProject({ ...activeDetailProject, isPrivate: newIsPrivate });
    }

    try {
      const res = await fetch(`/api/student/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: newIsPrivate }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui status karya");
      }
      showFeedback(
        newIsPrivate
          ? `Karya "${target.title}" kini diubah menjadi PRIVAT.`
          : `Karya "${target.title}" kini telah DIPUBLIKASIKAN di Galeri Resmi.`
      );
    } catch (err: any) {
      // Revert optimistic update
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, isPrivate: target.isPrivate } : p))
      );
      if (activeDetailProject && activeDetailProject.id === projectId) {
        setActiveDetailProject({ ...activeDetailProject, isPrivate: target.isPrivate });
      }
      showFeedback("Gagal memperbarui status visibilitas karya.");
    }
  };

  // Delete project
  const handleDelete = async (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    try {
      const res = await fetch(`/api/student/projects/${projectId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus karya");
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (activeDetailProject?.id === projectId) {
        setActiveDetailProject(null);
      }
      showFeedback(`Karya "${target?.title || "Karya"}" berhasil dihapus.`);
    } catch (err: any) {
      console.error("Error deleting project:", err);
      showFeedback("Gagal menghapus karya dari database. Silakan coba kembali.");
    }
  };

  // Save edit modal
  const handleSaveEdit = async (updates: Partial<GalleryProjectItem>) => {
    if (!activeEditProject) return;
    try {
      const res = await fetch(`/api/student/projects/${activeEditProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan perubahan karya");
      }
      showFeedback(`Perubahan pada "${data.project?.title || activeEditProject.title}" berhasil disimpan.`);
      setActiveEditProject(null);
      await loadProjects();
      if (activeDetailProject?.id === activeEditProject.id) {
        setActiveDetailProject(data.project);
      }
    } catch (err: any) {
      console.error("Error saving edits:", err);
      showFeedback("Gagal menyimpan perubahan karya.");
    }
  };

  // Filter & sort
  const filteredProjects = useMemo(() => {
    let list = [...projects];

    // Filter by visibility
    if (visibilityFilter === "public") {
      list = list.filter((p) => !p.isPrivate);
    } else if (visibilityFilter === "private") {
      list = list.filter((p) => Boolean(p.isPrivate));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p.tools && p.tools.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort order
    if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
    } else if (sortBy === "views") {
      list.sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
    } else {
      // Default: Newest (created_at desc)
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [projects, visibilityFilter, searchQuery, sortBy]);

  // Statistics
  const totalCount = projects.length;
  const publicCount = projects.filter((p) => !p.isPrivate).length;
  const privateCount = projects.filter((p) => p.isPrivate).length;
  const totalViews = projects.reduce((acc, p) => acc + (p.metrics?.views || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isLoading && <Loading text="Memuat karya..." />}
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* ── Breadcrumb Bar ── */}
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
              <Link href="/" className="hover:text-ink transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-300" />
              <Link href="/student" className="hover:text-ink transition-colors">
                Portal Siswa
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-300" />
              <span className="font-semibold text-ink">Karya Saya</span>
            </nav>

            <Link
              href="/gallery"
              className="text-xs font-bold text-primary hover:underline hidden sm:inline-flex items-center gap-1"
            >
              <span>Lihat Etalase Publik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Hero / Page Header ── */}
        <section className="border-b border-ink-150 bg-gradient-to-b from-[#FBF9F6] to-white pt-10 pb-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>MANAJEMEN KARYA KREATOR SISWA</span>
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
                  Karya & Portofolio Saya
                </h1>

                <p className="mt-3 text-sm sm:text-base text-ink-600 leading-relaxed max-w-[65ch]">
                  Kelola, sunting, dan bagikan seluruh proyek inovasi yang Anda bangun. Atur visibilitas proyek antara publik atau privat kapan saja.
                </p>
              </div>

              {/* Primary Action Button */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/student/create-project"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-[#6B1424] text-white rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Unggah Karya Baru</span>
                </Link>
              </div>
            </div>

            {/* ── Metric Highlights Bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-ink-150">
              <button
                type="button"
                onClick={() => setVisibilityFilter("all")}
                className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                    {totalCount}
                  </span>
                  <span className="text-xs font-bold text-ink-700 block mt-1">Total Karya</span>
                  <span className="text-[11px] text-ink-400 block mt-0.5">Seluruh karya diunggah</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibilityFilter("public")}
                className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-5 h-5 text-primary" />
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                    {publicCount}
                  </span>
                  <span className="text-xs font-bold text-ink-700 block mt-1">Karya Publik</span>
                  <span className="text-[11px] text-ink-400 block mt-0.5">Tampil di galeri resmi</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibilityFilter("private")}
                className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Lock className="w-5 h-5 text-primary" />
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                    {privateCount}
                  </span>
                  <span className="text-xs font-bold text-ink-700 block mt-1">Karya Privat</span>
                  <span className="text-[11px] text-ink-400 block mt-0.5">Hanya Anda &amp; pembimbing</span>
                </div>
              </button>

              <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Eye className="w-5 h-5 text-primary" />
                  <ArrowUpRight className="w-4 h-4 text-ink-300" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                    {totalViews.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs font-bold text-ink-700 block mt-1">Total Dilihat</span>
                  <span className="text-[11px] text-ink-400 block mt-0.5">Dari seluruh karya Anda</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Catalog & Toolbar Section ── */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          {/* Notification Toast */}
          {feedbackMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Interactive Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FBF9F6] border border-ink-150 mb-8">
            {/* Visibility Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-ink-150">
              <button
                type="button"
                onClick={() => setVisibilityFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  visibilityFilter === "all"
                    ? "bg-primary text-white shadow-xs"
                    : "text-ink-600 hover:text-ink"
                }`}
              >
                Semua ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("public")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  visibilityFilter === "public"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-ink-600 hover:text-ink"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publik ({publicCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibilityFilter("private")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  visibilityFilter === "private"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-ink-600 hover:text-ink"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Privat ({privateCount})</span>
              </button>
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-3 flex-1 max-w-lg justify-end">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari karya Anda..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-ink-150 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
                />
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl border border-ink-150 bg-white text-xs sm:text-sm font-semibold text-ink-700 focus:outline-hidden focus:border-primary cursor-pointer"
              >
                <option value="newest">Terbaru (Created At)</option>
                <option value="oldest">Terlama</option>
                <option value="views">Paling Banyak Dilihat</option>
              </select>
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((project) => (
                <StudentProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(p) => setActiveEditProject(p)}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={handleDelete}
                  onViewDetail={(p) => setActiveDetailProject(p)}
                />
              ))}
            </div>
          ) : !isLoading ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-ink-150 p-6 shadow-xs max-w-xl mx-auto">
              <EmptyState
                title="Belum Ada Karya Ditemukan"
                description={
                  searchQuery || visibilityFilter !== "all"
                    ? "Tidak ada karya yang cocok dengan filter atau kata kunci pencarian Anda."
                    : "Anda belum mengunggah karya portofolio. Mulai bagikan proyek tugas akhir, riset laboratorium, atau aplikasi Anda sekarang!"
                }
                action={
                  searchQuery || visibilityFilter !== "all"
                    ? {
                        label: "Reset Filter",
                        onClick: () => {
                          setSearchQuery("");
                          setVisibilityFilter("all");
                        },
                      }
                    : {
                        label: "Unggah Karya Pertama",
                        href: "/student/create-project",
                      }
                }
              />
            </div>
          ) : null}
        </section>
      </main>

      {/* Detail Project Modal (with scrollable body & full info) */}
      <StudentProjectDetailModal
        project={activeDetailProject}
        isOpen={Boolean(activeDetailProject)}
        onClose={() => setActiveDetailProject(null)}
        onEdit={(p) => {
          setActiveDetailProject(null);
          setActiveEditProject(p);
        }}
        onToggleVisibility={handleToggleVisibility}
      />

      {/* Edit Project Modal (with local image upload & smooth scrolling) */}
      <EditProjectModal
        project={activeEditProject}
        isOpen={Boolean(activeEditProject)}
        onClose={() => setActiveEditProject(null)}
        onSave={handleSaveEdit}
      />

      <Footer />
    </div>
  );
}
