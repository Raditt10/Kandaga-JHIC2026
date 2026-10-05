"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Lock,
  Pencil,
  Trash2,
  Calendar,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import type { GalleryProjectItem } from "@/data/galleryData";

export interface StudentProjectCardProps {
  project: GalleryProjectItem;
  onEdit: (project: GalleryProjectItem) => void;
  onToggleVisibility: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onViewDetail?: (project: GalleryProjectItem) => void;
}

export default function StudentProjectCard({
  project,
  onEdit,
  onToggleVisibility,
  onDelete,
  onViewDetail,
}: StudentProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Department color schemes
  // Department color schemes (Konsisten tema marun & netral Kandaga)
  const majorStyles: Record<string, { badge: string; border: string }> = {
    rpl: {
      badge: "bg-primary/10 text-primary border-primary/20",
      border: "hover:border-primary/40",
    },
    tkj: {
      badge: "bg-primary/10 text-primary border-primary/20",
      border: "hover:border-primary/40",
    },
    "analis-kimia": {
      badge: "bg-primary/10 text-primary border-primary/20",
      border: "hover:border-primary/40",
    },
  };

  const majorKey = project.major || project.jurusan || "rpl";
  const majorDisplay = project.majorLabel || project.jurusanLabel || "RPL";
  const currentMajorStyle = majorStyles[majorKey] || majorStyles.rpl;

  const isPrivate = Boolean(project.isPrivate);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : `${project.year || new Date().getFullYear()}`;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus karya "${project.title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      setIsDeleting(true);
      onDelete(project.id);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleVisibility(project.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(project);
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    if (onViewDetail) {
      e.preventDefault();
      onViewDetail(project);
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border border-ink-150 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 ${currentMajorStyle.border} ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* ── Image Media Container ── */}
      <div
        onClick={handleDetailClick}
        className="relative aspect-[16/10] w-full overflow-hidden bg-ink-100 block cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Buka detail karya: ${project.title}`}
      >
        <Image
          src={project.coverImage || "/images/preview-rpl.jpg"}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Department badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/95 shadow-xs ${currentMajorStyle.badge}`}
          >
            {majorDisplay}
          </span>

          {/* Visibility Badge (Public vs Private) */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs backdrop-blur-md transition-colors ${
              isPrivate
                ? "bg-amber-500/90 text-white border border-amber-400"
                : "bg-emerald-600/90 text-white border border-emerald-500"
            }`}
          >
            {isPrivate ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Privat</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Publik</span>
              </>
            )}
          </span>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
          <span className="flex items-center gap-1 font-mono font-medium drop-shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-white/80" />
            <span>{formattedDate}</span>
          </span>

          <span className="flex items-center gap-1 font-mono font-medium drop-shadow-xs">
            <Eye className="w-3.5 h-3.5 text-white/80" />
            <span>{project.metrics?.views || 0} tayangan</span>
          </span>
        </div>
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Project Title */}
        <div onClick={handleDetailClick} className="cursor-pointer">
          <h3 className="font-heading text-lg font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
        </div>

        {/* Tagline / Excerpt */}
        <p className="mt-2 text-xs sm:text-sm text-ink-600 line-clamp-2 leading-relaxed flex-1">
          {project.tagline || project.description}
        </p>

        {/* Tools Chips */}
        {project.tools && project.tools.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            {project.tools.slice(0, 3).map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 text-xs font-medium"
              >
                {tool}
              </span>
            ))}
            {project.tools.length > 3 && (
              <span className="text-xs text-ink-600 font-medium pl-1">
                +{project.tools.length - 3}
              </span>
            )}
          </div>
        )}

        {/* ── Creator Action Toolbar ── */}
        <div className="mt-5 pt-4 border-t border-ink-150 flex items-center justify-between gap-2">
          {/* Quick Visibility Toggle Button */}
          <button
            type="button"
            onClick={handleToggleClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              isPrivate
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-ink-100 text-ink-700 border-ink-150 hover:bg-ink-150"
            }`}
            title={isPrivate ? "Ubah jadi publik" : "Ubah jadi privat"}
          >
            {isPrivate ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publikasikan</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-ink-600" />
                <span>Jadikan Privat</span>
              </>
            )}
          </button>

          {/* Edit, View Modal, Full Page, & Delete Action Group */}
          <div className="flex items-center gap-1">
            {/* Quick View / Detail Modal button */}
            {onViewDetail && (
              <button
                type="button"
                onClick={handleDetailClick}
                className="p-2 rounded-xl text-ink-600 hover:text-black hover:bg-ink-100 transition cursor-pointer"
                title="Pratinjau detail karya (Modal)"
                aria-label="Lihat modal detail karya"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleEditClick}
              className="p-2 rounded-xl text-ink-600 hover:text-primary hover:bg-primary/10 transition cursor-pointer"
              title="Edit informasi karya"
              aria-label="Edit karya"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <Link
              href={`/student/my-projects/${project.id}`}
              className="p-2 rounded-xl text-ink-600 hover:text-black hover:bg-ink-100 transition"
              title="Buka halaman kelola & detail karya"
              aria-label="Halaman detail karya"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleDeleteClick}
              className="p-2 rounded-xl text-ink-600 hover:text-rose-700 hover:bg-rose-100/70 transition cursor-pointer"
              title="Hapus karya ini"
              aria-label="Hapus karya"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
