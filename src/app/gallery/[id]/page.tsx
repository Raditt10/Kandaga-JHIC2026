"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectCard from "@/components/gallery/ProjectCard";
import Loading from "@/components/ui/Loading";
import type { GalleryProjectItem } from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  Eye,
  ExternalLink,
  FileText,
  Lock,
  ShieldCheck,
  Award,
  ChevronRight,
} from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<GalleryProjectItem | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<GalleryProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/gallery/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.project && isMounted) {
            setProject(data.project);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch project from API:", error);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  const currentMajor = project?.major || project?.jurusan || "rpl";
  const currentMajorLabel = project?.majorLabel || project?.jurusanLabel || "RPL";

  useEffect(() => {
    if (!project) return;
    const fetchRelated = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.projects)) {
            const rel = data.projects
              .filter(
                (p: GalleryProjectItem) =>
                  p.id !== project.id &&
                  (p.major === currentMajor || p.jurusan === currentMajor)
              )
              .slice(0, 3);
            setRelatedProjects(rel);
          }
        }
      } catch (e) {
        console.error("Failed to fetch related projects:", e);
      }
    };
    fetchRelated();
  }, [project, currentMajor]);

  // Not found state
  if (!isLoading && !project) {
    notFound();
  }

  const currentImages =
    project?.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : [project?.coverImage || "/images/preview-rpl.jpg"];

  const majorColorMap: Record<string, { badge: string; text: string; bg: string }> = {
    rpl: {
      badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
      text: "text-[#8B1A2F]",
      bg: "bg-[#8B1A2F]",
    },
    tkj: {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      text: "text-blue-700",
      bg: "bg-blue-600",
    },
    "analis-kimia": {
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      text: "text-amber-800",
      bg: "bg-amber-600",
    },
  };

  const majorTheme = majorColorMap[currentMajor] || majorColorMap.rpl;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isLoading && <Loading />}
      <Navbar />

      {project && (
        <main className="flex-1 pt-24 pb-20">
        {/* ── Breadcrumb & Back Bar ── */}
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
              <Link href="/" className="hover:text-ink transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <Link href="/gallery" className="hover:text-ink transition-colors">
                Galeri Karya
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <span className="font-semibold text-ink truncate max-w-[200px] sm:max-w-xs">
                {project.title}
              </span>
            </nav>

            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-700 hover:text-[#8B1A2F] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Galeri</span>
            </Link>
          </div>
        </div>

        {/* ── Project Header Hero ── */}
        <section className="mx-auto max-w-7xl px-6 pt-8 pb-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            {/* Major Pill */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${majorTheme.badge}`}>
              {currentMajorLabel}
            </span>

            {/* Verification Status */}
            {project.status === "featured" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#E8C97A] text-[#543b00]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Karya Unggulan Sekolah</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi Kurasi Guru</span>
              </span>
            )}

            {/* Year */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-700 border border-ink-150">
              <Calendar className="w-3.5 h-3.5 text-ink-500" />
              <span>Tahun {project.year}</span>
            </span>

            {/* Views count */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-700 border border-ink-150">
              <Eye className="w-3.5 h-3.5 text-ink-500" />
              <span>{project.metrics?.views?.toLocaleString() || 0} tayangan</span>
            </span>
          </div>

          {/* Heading 1: Project Title */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-tight">
            {project.title}
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed max-w-[65ch]">
            {project.tagline}
          </p>

          {/* Quick Creator Mention Bar with Direct Link to Profile */}
          <div className="mt-6 pt-6 border-t border-ink-150 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-ink-200 shrink-0">
                <Image
                  src={project.studentAvatar || "/images/preview-rpl.jpg"}
                  alt={project.studentName || "Siswa"}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink">{project.studentName}</p>
                  {project.isStudentPrivate && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>Profil Privat</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-600">
                  {project.studentClass} &bull; Angkatan SMKN 13 Bandung
                </p>
              </div>
            </div>

            {/* Link to Student Profile */}
            <Link
              href={`/siswa/${project.studentId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-200 bg-white hover:border-[#8B1A2F] hover:text-[#8B1A2F] text-xs sm:text-sm font-bold text-ink transition-all shadow-xs"
            >
              <User className="w-4 h-4 text-[#8B1A2F]" />
              <span>Kunjungi Profil Siswa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Media Gallery Showcase ── */}
        <section className="mx-auto max-w-7xl px-6 mb-12">
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-ink-200 bg-ink-900 shadow-lg">
            <Image
              src={currentImages[activeImageIndex] || project.coverImage || "/images/preview-rpl.jpg"}
              alt={`${project.title} - Gambar ${activeImageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>

          {/* Thumbnails switcher */}
          {currentImages.length > 1 && (
            <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? "border-[#8B1A2F] ring-2 ring-[#8B1A2F]/30"
                      : "border-ink-200 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Pilih gambar ${idx + 1}`}
                >
                  <Image src={img} alt="Thumbnail" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Main Content Grid: Description (Left) + Metadata Sidebar (Right) ── */}
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Narrative & Technical Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <section aria-labelledby="heading-ringkasan">
              <h2 id="heading-ringkasan" className="font-heading text-2xl font-bold text-ink mb-4">
                Gambaran Umum Proyek
              </h2>
              <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
                {project.description}
              </p>
            </section>

            {/* Key Innovations */}
            {project.solutionHighlights && project.solutionHighlights.length > 0 && (
              <section aria-labelledby="heading-inovasi" className="pt-8 border-t border-ink-150">
                <h2 id="heading-inovasi" className="font-heading text-2xl font-bold text-ink mb-4">
                  Fitur &amp; Inovasi Utama
                </h2>
                <ul className="space-y-3 max-w-[65ch]">
                  {project.solutionHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-base text-ink-700 leading-relaxed">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Mentor / Advisor Review Box */}
            {project.advisor && (
              <section aria-labelledby="heading-kurasi" className="pt-8 border-t border-ink-150">
                <h2 id="heading-kurasi" className="font-heading text-2xl font-bold text-ink mb-4">
                  Kurasi &amp; Catatan Pembimbing
                </h2>
                <div className="bg-[#FBF9F6] border border-ink-200 rounded-3xl p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#8B1A2F]/10 text-[#8B1A2F] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{project.advisor.name}</p>
                      <p className="text-xs text-ink-600">{project.advisor.role}</p>
                    </div>
                  </div>
                  <blockquote className="italic text-base text-ink-700 leading-relaxed pl-4 border-l-2 border-[#8B1A2F]">
                    &ldquo;{project.advisor.reviewNotes}&rdquo;
                  </blockquote>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Student Creator & Specifications Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <h2 className="sr-only">Informasi Pembuat dan Spesifikasi</h2>

            {/* Student Creator Card */}
            <div className="bg-white rounded-3xl p-6 border border-ink-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">
                <User className="w-4 h-4 text-[#8B1A2F]" />
                <span>Kreator Siswa</span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-ink-200 shrink-0">
                  <Image
                    src={project.studentAvatar || "/images/preview-rpl.jpg"}
                    alt={project.studentName || "Siswa"}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">
                    {project.studentName}
                  </h3>
                  <p className="text-xs text-ink-600 font-medium mt-0.5">
                    {project.studentClass}
                  </p>
                  <p className="text-xs text-ink-500">
                    {currentMajorLabel} &bull; SMKN 13 Bandung
                  </p>
                </div>
              </div>

              {/* Privacy Warning / Notice on Detail Card */}
              {project.isStudentPrivate ? (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Profil Siswa Bersifat Privat</span>
                    <span className="text-amber-800">
                      Siswa membatasi visibilitas profil pribadinya dari publik.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Portofolio Publik Terverifikasi Sekolah</span>
                </div>
              )}

              {/* Big CTA Button to Student Profile */}
              <Link
                href={`/siswa/${project.studentId}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#8B1A2F] to-[#6B1424] hover:from-[#76102f] hover:to-[#57101e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8B1A2F]/20 transition-all cursor-pointer"
              >
                <span>Lihat Profil Siswa</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tools & Technology Card */}
            {project.tools && project.tools.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-ink-200 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-bold text-ink">
                  Teknologi &amp; Instrumen
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 rounded-xl bg-ink-100 text-ink-800 text-xs font-semibold border border-ink-150"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Links / External Access */}
            <div className="bg-white rounded-3xl p-6 border border-ink-200 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-bold text-ink">
                Tautan &amp; Repositori
              </h3>
              <div className="space-y-2.5">
                {project.links?.demoUrl && (
                  <a
                    href={project.links.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] text-xs font-bold text-ink transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Aplikasi / Live Demo</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {project.links?.githubUrl && (
                  <a
                    href={project.links.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] text-xs font-bold text-ink transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Repositori GitHub</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {project.links?.docUrl && (
                  <a
                    href={project.links.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] text-xs font-bold text-ink transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Laporan Riset (PDF)</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* School Endorsement Badge */}
            <div className="bg-[#FBF9F6] rounded-3xl p-6 border border-ink-150 text-xs text-ink-600 space-y-2">
              <p className="font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Legalitas &amp; Hak Cipta</span>
              </p>
              <p className="leading-relaxed">
                Seluruh materi kode, skema rangkaian, dan data laboratorium dilindungi oleh hak cipta siswa SMKN 13 Bandung. Untuk kerja sama komersial atau rekrutmen magang, silakan kontak melalui unit BKK Sekolah.
              </p>
            </div>
          </aside>
        </div>

        {/* ── Related Projects Section ── */}
        {relatedProjects.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 mt-20 pt-16 border-t border-ink-150">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-semibold tracking-wider text-[#8B1A2F] uppercase">
                  EKSPLORASI LANJUTAN
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
                  Karya Terkait dari {currentMajorLabel}
                </h2>
              </div>
              <Link
                href="/gallery"
                className="text-xs sm:text-sm font-bold text-[#8B1A2F] hover:underline"
              >
                Lihat Seluruh Galeri &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProjects.map((rel) => (
                <ProjectCard key={rel.id} project={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
      )}

      <Footer />
    </div>
  );
}
