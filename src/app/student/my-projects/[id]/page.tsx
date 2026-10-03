"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Loading from "@/components/ui/Loading";
import EditProjectModal from "@/components/student/EditProjectModal";
import type { GalleryProjectItem } from "@/data/galleryData";
import {
  ArrowLeft,
  Globe,
  Lock,
  Pencil,
  Trash2,
  Calendar,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Share2,
  FileCode,
  ShieldCheck,
  Award,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<GalleryProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/projects/${resolvedParams.id}`);
      if (!res.ok) {
        setProject(null);
        return;
      }
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
      } else if (data.projects) {
        setProject(data.projects);
      } else {
        setProject(null);
      }
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      showToast("Gagal memuat data karya.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();

    const handleUpdate = () => {
      loadProject();
    };

    window.addEventListener("kandaga_projects_updated", handleUpdate);
    return () => {
      window.removeEventListener("kandaga_projects_updated", handleUpdate);
    };
  }, [resolvedParams.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleVisibility = async () => {
    if (!project) return;
    const targetIsPrivate = !project.isPrivate;
    try {
      const res = await fetch(`/api/student/projects/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: targetIsPrivate }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        showToast(
          data.project.isPrivate
            ? "Status visibilitas diubah menjadi PRIVAT."
            : "Karya berhasil DIPUBLIKASIKAN di Galeri Resmi SMKN 13!"
        );
      } else {
        showToast(data.error || "Gagal memperbarui status visibilitas karya.");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      showToast("Gagal memperbarui status visibilitas.");
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus karya "${project.title}"? Tindakan ini permanen.`
      )
    ) {
      try {
        const deleted = await fetch(`/api/student/projects/${resolvedParams.id}`, {
          method: "DELETE",
        });
        const deletedData = await deleted.json();
        if (deletedData.success) {
          showToast("Karya berhasil dihapus!");
          router.push("/student/my-projects");
        } else {
          showToast(deletedData.error || "Gagal menghapus karya.");
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
        showToast("Gagal menghapus karya.");
      }
    }
  };

  const handleSaveEdit = async (updates: Partial<GalleryProjectItem>) => {
    if (!project) return;
    try {
      const updated = await fetch(`/api/student/projects/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const updatedData = await updated.json();
      if (updatedData.success && updatedData.project) {
        setProject(updatedData.project);
        setIsEditModalOpen(false);
        showToast("Perubahan detail karya berhasil disimpan!");
      } else {
        showToast(updatedData.error || "Gagal menyimpan perubahan karya.");
      }
    } catch (error) {
      console.error("Failed to update project data:", error);
      showToast("Gagal memperbarui karya.");
    }
  };

  if (!isLoading && !project) {
    notFound();
  }

  const currentMajor = project?.major || project?.jurusan || "rpl";
  const currentMajorLabel = project?.majorLabel || project?.jurusanLabel || "RPL";
  const isPrivate = Boolean(project?.isPrivate);

  const images =
    project?.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : [project?.coverImage || "/images/preview-rpl.jpg"];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isLoading && <Loading text="Memuat detail karya..." />}
      <Navbar />

      {project && (
        <main className="flex-1 pt-24 pb-20">
          {/* ── Breadcrumb Bar ── */}
          <div className="border-b border-ink-150 bg-[#FBF9F6]">
            <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-xs sm:text-sm text-ink-600"
              >
                <Link href="/" className="hover:text-ink transition-colors">
                  Beranda
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                <Link
                  href="/student/my-projects"
                  className="hover:text-ink transition-colors"
                >
                  Karya Saya
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                <span className="font-semibold text-ink truncate max-w-[200px] sm:max-w-xs">
                  {project.title}
                </span>
              </nav>

              <Link
                href="/student/my-projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-black transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Karya Saya</span>
              </Link>
            </div>
          </div>

          {/* ── Creator Action & Visibility Control Bar ── */}
          <div className="bg-zinc-900 text-white border-b border-zinc-800">
            <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Visibility status indicator */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isPrivate
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {isPrivate ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Status: PRIVAT</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Status: PUBLIK (Di Etalase Galeri)</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  {isPrivate
                    ? "Karya ini tersembunyi dari publik."
                    : "Karya ini dapat ditemukan oleh industri & publik."}
                </span>
              </div>

              {/* Action Buttons for Creator */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleVisibility}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isPrivate
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                  }`}
                >
                  {isPrivate ? (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publikasikan Karya</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Ubah ke Privat</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B1A2F] hover:bg-[#6B1424] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Informasi Karya</span>
                </button>

                {!isPrivate && (
                  <Link
                    href={`/gallery/${project.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition"
                    title="Buka halaman etalase publik galeri"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat di Galeri</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  title="Hapus karya ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mx-auto max-w-7xl px-6 pt-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            </div>
          )}

          {/* ── Main Content Area ── */}
          <div className="mx-auto max-w-7xl px-6 pt-8">
            {/* Header Hero Section */}
            <div className="mb-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B1A2F]/10 text-[#8B1A2F] border border-[#8B1A2F]/20">
                  {currentMajorLabel}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Tahun {project.year}
                </span>

                {project.status === "featured" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8C97A] text-[#543b00]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Karya Unggulan Sekolah</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
                {project.title}
              </h1>

              {/* Tagline */}
              <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed max-w-[65ch]">
                {project.tagline || project.description}
              </p>
            </div>

            {/* Media Showcase (Hero aspect 16/9) */}
            <div className="mb-12">
              <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-ink-100 border border-ink-150 shadow-md">
                <Image
                  src={images[activeImageIndex] || project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Thumbnails strip */}
              {images.length > 1 && (
                <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[#8B1A2F] ring-2 ring-[#8B1A2F]/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid 2 Kolom: Detail Narasi + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Kolom Kiri: Deskripsi & Inovasi */}
              <div className="lg:col-span-8 space-y-10">
                {/* Deskripsi */}
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink mb-4">
                    Tentang Karya Proyek
                  </h2>
                  <div className="text-base text-ink-700 leading-relaxed space-y-4 max-w-[65ch]">
                    {project.description.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                {/* Solution Highlights */}
                {project.solutionHighlights && project.solutionHighlights.length > 0 && (
                  <div className="pt-8 border-t border-ink-150">
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink mb-4">
                      Poin Inovasi & Nilai Tambah
                    </h2>
                    <ul className="space-y-3 max-w-[65ch]">
                      {project.solutionHighlights.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-base text-ink-700 leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Review Pembimbing */}
                {project.advisor && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#FBF9F6] border border-ink-150">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1A2F]/10 text-[#8B1A2F] mb-3">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Catatan Pembimbing Sekolah</span>
                    </span>
                    <blockquote className="text-base text-ink-800 italic leading-relaxed">
                      &ldquo;{project.advisor.reviewNotes}&rdquo;
                    </blockquote>
                    <div className="mt-4 pt-4 border-t border-ink-150 text-xs text-ink-600">
                      <span className="font-bold text-ink-900 block">{project.advisor.name}</span>
                      <span>{project.advisor.role}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Sidebar Metadata & Links */}
              <div className="lg:col-span-4 space-y-6">
                {/* Tech Stack Box */}
                <div className="p-6 rounded-3xl bg-white border border-ink-150 shadow-xs">
                  <h3 className="font-heading text-base font-bold text-ink mb-3 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#8B1A2F]" />
                    <span>Teknologi Digunakan</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tools && project.tools.length > 0 ? (
                      project.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-3 py-1 rounded-lg bg-ink-100 text-ink-800 text-xs font-medium"
                        >
                          {tool}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500 italic">Belum ada tools ditambahkan.</span>
                    )}
                  </div>
                </div>

                {/* Tautan Proyek */}
                <div className="p-6 rounded-3xl bg-white border border-ink-150 shadow-xs space-y-3">
                  <h3 className="font-heading text-base font-bold text-ink mb-1">
                    Tautan Proyek
                  </h3>

                  {project.links?.demoUrl ? (
                    <a
                      href={project.links.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#8B1A2F] text-white text-xs font-bold hover:bg-[#6B1424] transition shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Kunjungi Live Demo</span>
                      </span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </a>
                  ) : null}

                  {project.links?.githubUrl ? (
                    <a
                      href={project.links.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        <span>Repositori GitHub</span>
                      </span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </a>
                  ) : null}

                  {!project.links?.demoUrl && !project.links?.githubUrl && (
                    <p className="text-xs text-zinc-500 italic">
                      Belum ada tautan demo atau repositori yang disertakan.
                    </p>
                  )}
                </div>

                {/* Edit Button in Sidebar */}
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-ink-300 text-xs font-bold text-zinc-700 hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Ubah Data Karya Ini</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Edit Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <Footer />
    </div>
  );
}
