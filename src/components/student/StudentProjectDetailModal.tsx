"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Globe,
  Lock,
  Pencil,
  Calendar,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  FileCode,
  Tag,
  Share2,
} from "lucide-react";
import type { GalleryProjectItem } from "@/data/galleryData";

export interface StudentProjectDetailModalProps {
  project: GalleryProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: GalleryProjectItem) => void;
  onToggleVisibility?: (projectId: string) => void;
}

export default function StudentProjectDetailModal({
  project,
  isOpen,
  onClose,
  onEdit,
  onToggleVisibility,
}: StudentProjectDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset image index when project changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [project?.id]);

  if (!isOpen || !project) return null;

  const images =
    project.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : [project.coverImage || "/images/preview-rpl.jpg"];

  const isPrivate = Boolean(project.isPrivate);

  const majorLabels: Record<string, string> = {
    rpl: "Rekayasa Perangkat Lunak",
    tkj: "Teknik Komputer Jaringan",
    "analis-kimia": "Analis Kimia",
  };

  const majorSlug = project.major || project.jurusan || "rpl";
  const majorName = majorLabels[majorSlug] || project.majorLabel || project.jurusanLabel || "RPL";

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : `${project.year || new Date().getFullYear()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-ink-150 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* ── Sticky Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-150 bg-[#FBF9F6] shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B1A2F]/10 text-[#8B1A2F] border border-[#8B1A2F]/20">
              {majorName}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isPrivate
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isPrivate ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Karya Privat</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Karya Publik</span>
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition cursor-pointer"
            aria-label="Tutup modal detail karya"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Modal Body (With Smooth Scrolling & Custom Scrollbar) ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scroll-smooth divide-y divide-ink-150/70">
          {/* 1. Header Information & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs text-ink-600 mb-2 font-mono">
              <Calendar className="w-3.5 h-3.5 text-ink-400" />
              <span>Diterbitkan: {formattedDate}</span>
              <span>·</span>
              <Eye className="w-3.5 h-3.5 text-ink-400" />
              <span>{project.metrics?.views || 0} tayangan</span>
            </div>

            <h2
              id="project-detail-modal-title"
              className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-snug"
            >
              {project.title}
            </h2>

            {project.tagline && (
              <p className="mt-2 text-sm sm:text-base text-ink-700 font-medium leading-relaxed">
                {project.tagline}
              </p>
            )}
          </div>

          {/* 2. Visual Media Carousel & Gallery Preview */}
          <div className="pt-6">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-ink-100 border border-ink-150 shadow-sm">
              <Image
                src={images[activeImageIndex] || project.coverImage || "/images/preview-rpl.jpg"}
                alt={project.title}
                fill
                priority
                className="object-cover transition-opacity duration-300"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnails List */}
            {images.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#8B1A2F] ring-2 ring-[#8B1A2F]/20 scale-105"
                        : "border-ink-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Deskripsi & Latar Belakang Masalah */}
          <div className="pt-6">
            <h3 className="font-heading text-base font-bold text-ink mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B1A2F]" />
              <span>Deskripsi & Gambaran Umum Solusi</span>
            </h3>
            <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
              {project.description || "Belum ada deskripsi mendetail untuk karya ini."}
            </p>
          </div>

          {/* 4. Solusi Utama & Poin Inovasi */}
          {project.solutionHighlights && project.solutionHighlights.length > 0 && (
            <div className="pt-6">
              <h3 className="font-heading text-base font-bold text-ink mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Poin Keunggulan & Solusi Inovasi</span>
              </h3>
              <ul className="space-y-2.5">
                {project.solutionHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-ink-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. Alat & Teknologi (Tech Stack) */}
          {project.tools && project.tools.length > 0 && (
            <div className="pt-6">
              <h3 className="font-heading text-base font-bold text-ink mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Teknologi & Instrumen yang Digunakan</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-cream border border-ink-150 text-ink-800 text-xs font-semibold"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 6. Catatan Guru Pembimbing (Jika ada) */}
          {project.advisor && (
            <div className="pt-6">
              <div className="p-5 rounded-2xl bg-[#FBF9F6] border border-ink-150 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Catatan Evaluasi Guru Pembimbing: {project.advisor.name}</span>
                </div>
                <p className="text-xs text-ink-700 leading-relaxed italic">
                  &ldquo;{project.advisor.reviewNotes || "Karya memenuhi standar kurikulum kejuruan."}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Modal Footer ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-ink-150 bg-[#FBF9F6] shrink-0">
          <div className="flex items-center gap-2">
            {onToggleVisibility && (
              <button
                type="button"
                onClick={() => onToggleVisibility(project.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isPrivate
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                    : "bg-white text-zinc-700 border-ink-200 hover:bg-zinc-100"
                }`}
              >
                {isPrivate ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Publikasikan ke Galeri</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Jadikan Privat</span>
                  </>
                )}
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-ink-200 text-xs font-bold text-ink hover:border-[#8B1A2F] hover:text-[#8B1A2F] transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Informasi</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/student/my-projects/${project.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1A2F] text-white text-xs font-bold hover:bg-[#6B1424] transition shadow-xs"
            >
              <span>Buka Halaman Penuh</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-ink-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
