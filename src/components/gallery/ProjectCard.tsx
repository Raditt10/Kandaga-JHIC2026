"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CheckCircle2, Lock, Sparkles, Eye } from "lucide-react";
import type { JurusanSlug } from "@/types";

export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    tagline: string;
    description: string;
    solutionHighlights?: string[];
    major?: JurusanSlug;
    majorLabel?: string;
    jurusan?: JurusanSlug;
    jurusanLabel?: string;
    year: number;
    coverImage: string;
    galleryImages?: string[];
    status?: "verified" | "featured";
    badgeTier?: "gold" | "silver" | "bronze";
    badgeLabel?: string;
    tools: string[];
    studentId: string;
    studentName: string;
    studentAvatar: string;
    studentClass: string;
    isStudentPrivate: boolean;
    advisor?: {
      name: string;
      role: string;
      reviewNotes: string;
    };
    metrics?: {
      views: number;
      likes: number;
    };
    links?: {
      demoUrl?: string;
      githubUrl?: string;
      docUrl?: string;
    };
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Department color schemes (Konsisten tema marun & netral Kandaga)
  const majorStyles: Record<string, { badge: string; border: string }> = {
    rpl: {
      badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
      border: "hover:border-[#8B1A2F]/40",
    },
    tkj: {
      badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
      border: "hover:border-[#8B1A2F]/40",
    },
    "analis-kimia": {
      badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
      border: "hover:border-[#8B1A2F]/40",
    },
  };

  const majorKey = project.major || project.jurusan || "rpl";
  const majorDisplay = project.majorLabel || project.jurusanLabel || "RPL";
  const currentMajorStyle = majorStyles[majorKey] || majorStyles.rpl;

  return (
    <Link
      href={`/gallery/${project.id}`}
      className={`group relative flex flex-col bg-white rounded-2xl border border-ink-150 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 ${currentMajorStyle.border} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#8B1A2F]`}
      aria-label={`Buka detail karya: ${project.title}`}
    >
      {/* ── Image Media Container ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-100">
        <Image
          src={project.coverImage || "/images/preview-rpl.jpg"}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Department badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/95 shadow-xs ${currentMajorStyle.badge}`}
          >
            {majorDisplay}
          </span>

          {/* Verification Badge */}
          {project.status === "featured" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8C97A] text-[#543b00] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Unggulan</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-emerald-800 border border-emerald-200/80 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Terverifikasi</span>
            </span>
          )}
        </div>

        {/* Bottom image overlay: Year & Views */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-medium">
          <span className="bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
            Tahun {project.year}
          </span>
          <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
            <Eye className="w-3.5 h-3.5" />
            <span>{(project.metrics?.views || 0).toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* ── Card Content ── */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Project Title */}
        <h3 className="font-heading text-lg font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
          {project.title}
        </h3>

        {/* Excerpt / Tagline */}
        <p className="mt-2 text-sm text-ink-600 line-clamp-2 leading-relaxed flex-1">
          {project.tagline}
        </p>

        {/* Tools chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tools?.slice(0, 3).map((tool) => (
            <span
              key={tool}
              className="inline-block px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 text-xs font-medium"
            >
              {tool}
            </span>
          ))}
          {project.tools && project.tools.length > 3 && (
            <span className="inline-block px-1.5 py-0.5 text-xs text-ink-500 font-medium">
              +{project.tools.length - 3}
            </span>
          )}
        </div>

        {/* Creator attribution footer */}
        <div className="mt-5 pt-4 border-t border-ink-150 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-ink-200 bg-ink-100">
              <Image
                src={project.studentAvatar || "/images/preview-rpl.jpg"}
                alt={project.studentName || "Siswa"}
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate group-hover:text-primary transition-colors">
                {project.studentName}
              </p>
              <div className="flex items-center gap-1 text-xs text-ink-500 truncate">
                <span>{project.studentClass}</span>
                {project.isStudentPrivate && (
                  <span className="inline-flex items-center text-amber-700 font-medium ml-1" title="Profil Privat">
                    <Lock className="w-3 h-3 inline mr-0.5" />
                    Privat
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action indicator button */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 group-hover:bg-[#8B1A2F] group-hover:text-white transition-all duration-200">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
