import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProjectCard from "@/components/gallery/ProjectCard"
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  Eye,
  ExternalLink,
  FileText,
  ShieldCheck,
  Award,
  ChevronRight,
  ShoppingBag,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type MajorSlug = "rpl" | "tkj" | "analis-kimia"

interface ProjectDetail {
  id: string
  title: string
  tagline: string
  description: string
  solutionHighlights: string[]
  major: MajorSlug
  majorLabel: string
  jurusan: MajorSlug
  jurusanLabel: string
  year: number
  coverImage: string
  galleryImages: string[]
  status: "featured" | "verified"
  badgeTier?: "gold" | "silver" | "bronze"
  badgeLabel?: string
  tools: string[]
  studentId: string
  studentName: string
  studentAvatar: string
  studentClass: string
  isStudentPrivate: boolean
  advisor?: { name: string; role: string; reviewNotes: string }
  metrics: { views: number; likes: number }
  score: number | null
  majorForRelated: MajorSlug
  links: { demoUrl?: string; githubUrl?: string; docUrl?: string }
}

interface RelatedProject {
  id: string
  title: string
  tagline: string
  description: string
  solutionHighlights: string[]
  major: MajorSlug
  majorLabel: string
  jurusan: MajorSlug
  jurusanLabel: string
  year: number
  coverImage: string
  galleryImages: string[]
  status: "featured" | "verified"
  tools: string[]
  studentId: string
  studentName: string
  studentAvatar: string
  studentClass: string
  isStudentPrivate: boolean
  advisor?: { name: string; role: string; reviewNotes: string }
  metrics: { views: number; likes: number }
  links: Record<string, string>
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

async function fetchProject(id: string): Promise<ProjectDetail | null> {
  try {
    const res = await fetch(`${BASE}/api/gallery/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.project ?? null
  } catch (err) {
    console.error("[gallery/[id]] fetchProject:", err)
    return null
  }
}

async function fetchRelated(major: MajorSlug, excludeId: string): Promise<RelatedProject[]> {
  try {
    // Ambil semua karya lalu filter di sini — galeri publik biasanya < 200 item
    // dan sudah di-cache di /api/gallery, jadi tidak ada overhead tambahan.
    const res = await fetch(`${BASE}/api/gallery`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    const all: RelatedProject[] = Array.isArray(data.projects) ? data.projects : []
    return all
      .filter((p) => p.id !== excludeId && (p.major === major || p.jurusan === major))
      .slice(0, 3)
  } catch {
    return []
  }
}

// ─── Color map ────────────────────────────────────────────────────────────────

const MAJOR_THEME: Record<MajorSlug, { badge: string; text: string; bg: string }> = {
  rpl: {
    badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
    text: "text-[#8B1A2F]",
    bg: "bg-[#8B1A2F]",
  },
  tkj: {
    badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
    text: "text-[#8B1A2F]",
    bg: "bg-[#8B1A2F]",
  },
  "analis-kimia": {
    badge: "bg-[#8B1A2F]/10 text-[#8B1A2F] border-[#8B1A2F]/20",
    text: "text-[#8B1A2F]",
    bg: "bg-[#8B1A2F]",
  },
}

// ─── Image gallery — client island ───────────────────────────────────────────
// Hanya bagian thumbnail switcher yang perlu interaktivitas.
// Komponen kecil ini dipisah agar sisa halaman tetap server-rendered.

import GalleryImageViewer from "@/components/gallery/GalleryImageViewer"

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Metadata per karya. Judul dan ringkasan diambil dari data karya yang sama
 * dengan yang dipakai halaman ini, sehingga pratinjau tautan di mesin pencari
 * maupun media sosial menampilkan karya yang benar — bukan judul generik situs.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await fetchProject(id)

  if (!project) {
    return {
      title: "Kandaga",
      robots: { index: false, follow: true },
    }
  }

  const description = (project.tagline || project.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155)
  const projectTitle = project.title || "Detail Karya"

  return {
    title: "Kandaga",
    description,
    alternates: { canonical: `/gallery/${project.id}` },
    openGraph: {
      type: "article",
      title: `${projectTitle} | Kandaga`,
      description,
      url: `/gallery/${project.id}`,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params

  // Fetch project once, then derive related from the same result — no double fetch.
  const project = await fetchProject(id)
  if (!project) notFound()

  const related = await fetchRelated(project.majorForRelated, project.id)

  const theme = MAJOR_THEME[project.major] ?? MAJOR_THEME.rpl
  const images =
    project.galleryImages && project.galleryImages.length > 0
      ? project.galleryImages
      : [project.coverImage]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">

        {/* ── Breadcrumb ── */}
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
              <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <Link href="/gallery" className="hover:text-ink transition-colors">Galeri Karya</Link>
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
              Kembali ke Galeri
            </Link>
          </div>
        </div>

        {/* ── Project Header ── */}
        <section className="mx-auto max-w-7xl px-6 pt-8 pb-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
              {project.majorLabel}
            </span>

            {project.status === "featured" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#E8C97A] text-[#543b00]">
                <Sparkles className="w-3.5 h-3.5" />
                Karya Unggulan Sekolah
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Terverifikasi Kurasi Guru
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-700 border border-ink-150">
              <Calendar className="w-3.5 h-3.5 text-ink-500" />
              Tahun {project.year}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-700 border border-ink-150">
              <Eye className="w-3.5 h-3.5 text-ink-500" />
              {project.metrics.views.toLocaleString("id-ID")} tayangan
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed max-w-[65ch]">
            {project.tagline}
          </p>

          {/* Creator bar */}
          <div className="mt-6 pt-6 border-t border-ink-150 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-ink-200 shrink-0">
                <Image
                  src={project.studentAvatar}
                  alt={project.studentName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{project.studentName}</p>
                <p className="text-xs text-ink-600">
                  {project.studentClass} &bull; SMKN 13 Bandung
                </p>
              </div>
            </div>

            <Link
              href={`/siswa/${project.studentId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-200 bg-white hover:border-[#8B1A2F] hover:text-[#8B1A2F] text-xs sm:text-sm font-bold text-ink transition shadow-xs"
            >
              <User className="w-4 h-4 text-[#8B1A2F]" />
              Kunjungi Profil Siswa
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Image Viewer (client island) ── */}
        <section className="mx-auto max-w-7xl px-6 mb-12">
          <GalleryImageViewer images={images} title={project.title} />
        </section>

        {/* ── Main Content + Sidebar ── */}
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left */}
          <div className="lg:col-span-8 space-y-10">
            <section aria-labelledby="heading-ringkasan">
              <h2 id="heading-ringkasan" className="font-heading text-2xl font-bold text-ink mb-4">
                Gambaran Umum Proyek
              </h2>
              <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
                {project.description}
              </p>
            </section>

            {project.solutionHighlights.length > 0 && (() => {
              const bludItem = project.solutionHighlights.find((h) =>
                h.includes("Komersialisasi BLUD")
              )
              const cleanHighlights = project.solutionHighlights.filter(
                (h) => !h.includes("Komersialisasi BLUD")
              )

              // Parse tipe & estimasi harga dari string BLUD
              // Contoh: "Tersedia Komersialisasi BLUD (Produk Jadi / Lisensi — Estimasi: 1.299.000)"
              let bludType = ""
              let bludEstimasi = ""
              if (bludItem) {
                const match = bludItem.match(/\(([^)]+)\)/)
                if (match) {
                  const inner = match[1]
                  const parts = inner.split("—")
                  bludType = parts[0].trim()
                  if (parts[1]) {
                    bludEstimasi = parts[1].replace("Estimasi:", "").trim()
                  }
                }
              }

              return (
                <>
                  {cleanHighlights.length > 0 && (
                    <section aria-labelledby="heading-inovasi" className="pt-8 border-t border-ink-150">
                      <h2 id="heading-inovasi" className="font-heading text-2xl font-bold text-ink mb-4">
                        Fitur &amp; Inovasi Utama
                      </h2>
                      <ul className="space-y-3 max-w-[65ch]">
                        {cleanHighlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            </div>
                            <span className="text-base text-ink-700 leading-relaxed">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {bludItem && (
                    <section aria-labelledby="heading-jual" className="pt-8 border-t border-ink-150">
                      <h2 id="heading-jual" className="font-heading text-2xl font-bold text-ink mb-4">
                        Penjualan Karya
                      </h2>
                      <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 max-w-[65ch]">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-amber-800">
                            Karya ini tersedia untuk dijual
                          </p>
                          <p className="text-sm text-amber-700 mt-1">
                            Tipe: <span className="font-semibold">{bludType || "—"}</span>
                          </p>
                          {bludEstimasi && (
                            <p className="text-sm text-amber-700 mt-0.5">
                              Estimasi harga:{" "}
                              <span className="font-semibold">Rp {bludEstimasi}</span>
                            </p>
                          )}
                          <p className="text-sm text-amber-600/80 mt-2 leading-relaxed">
                            Komersialisasi melalui skema BLUD Teaching Factory. Hubungi sekolah untuk
                            informasi pembelian atau kerja sama.
                          </p>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )
            })()}

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

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <h2 className="sr-only">Informasi Pembuat dan Spesifikasi</h2>

            {/* Creator card */}
            <div className="bg-white rounded-3xl p-6 border border-ink-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-500 uppercase">
                <User className="w-4 h-4 text-[#8B1A2F]" />
                Kreator Siswa
              </div>

              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-ink-200 shrink-0">
                  <Image
                    src={project.studentAvatar}
                    alt={project.studentName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">{project.studentName}</h3>
                  <p className="text-xs text-ink-600 font-medium mt-0.5">{project.studentClass}</p>
                  <p className="text-xs text-ink-500">{project.majorLabel} &bull; SMKN 13 Bandung</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                Portofolio Publik Terverifikasi Sekolah
              </div>

              <Link
                href={`/siswa/${project.studentId}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#8B1A2F] to-[#6B1424] hover:from-[#76102f] hover:to-[#57101e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8B1A2F]/20 transition"
              >
                Lihat Profil Siswa
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tools */}
            {project.tools.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-ink-200 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-bold text-ink">Teknologi &amp; Instrumen</h3>
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

            {/* External links */}
            <div className="bg-white rounded-3xl p-6 border border-ink-200 shadow-sm space-y-4">
              <h3 className="font-heading text-sm font-bold text-ink">Tautan &amp; Repositori</h3>
              <div className="space-y-2.5">
                {project.links?.demoUrl && (
                  <a
                    href={project.links.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] text-xs font-bold text-ink transition"
                  >
                    <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" />Aplikasi / Live Demo</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {project.links?.githubUrl && (
                  <a
                    href={project.links.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] text-xs font-bold text-ink transition"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      Repositori GitHub
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {project.links?.docUrl && (
                  <a
                    href={project.links.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 hover:bg-[#8B1A2F]/10 hover:text-[#8B1A2F] text-xs font-bold text-ink transition"
                  >
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" />Laporan Riset (PDF)</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
                {!project.links?.demoUrl && !project.links?.githubUrl && !project.links?.docUrl && (
                  <p className="text-xs text-ink-300 text-center py-2">Belum ada tautan yang ditambahkan.</p>
                )}
              </div>
            </div>

            {/* Copyright notice */}
            <div className="bg-[#FBF9F6] rounded-3xl p-6 border border-ink-150 text-xs text-ink-600 space-y-2">
              <p className="font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Legalitas &amp; Hak Cipta
              </p>
              <p className="leading-relaxed">
                Seluruh materi kode, skema rangkaian, dan data laboratorium dilindungi oleh hak cipta siswa SMKN 13 Bandung. Untuk kerja sama komersial atau rekrutmen magang, silakan kontak melalui unit BKK Sekolah.
              </p>
            </div>
          </aside>
        </div>

        {/* ── Related Projects ── */}
        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 mt-20 pt-16 border-t border-ink-150">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-semibold tracking-wider text-[#8B1A2F] uppercase">
                  EKSPLORASI LANJUTAN
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
                  Karya Terkait dari {project.majorLabel}
                </h2>
              </div>
              <Link href="/gallery" className="text-xs sm:text-sm font-bold text-[#8B1A2F] hover:underline">
                Lihat Seluruh Galeri &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {related.map((rel) => (
                <ProjectCard key={rel.id} project={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
