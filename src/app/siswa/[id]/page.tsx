import React from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProjectCard from "@/components/gallery/ProjectCard"
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  Building2,
  ChevronRight,
  Briefcase,
  AlertCircle,
} from "lucide-react"

// ─── Tipe yang dikembalikan oleh /api/siswa/[id] ─────────────────────────────

interface StudentData {
  id: string
  name: string
  nis: string
  class: string
  generation: number
  bio: string | null
  currentCareer: string | null
  photoUrl: string | null
  majorName: string
  majorFullName: string
}

interface ProjectData {
  id: string
  title: string
  tagline: string
  description: string
  solutionHighlights: string[]
  major: "rpl" | "tkj" | "analis-kimia"
  majorLabel: string
  jurusan: "rpl" | "tkj" | "analis-kimia"
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
  links: Record<string, string>
}

// ─── Data fetcher (server-side) ───────────────────────────────────────────────

async function fetchStudentProfile(id: string): Promise<{
  student: StudentData
  projects: ProjectData[]
} | null> {
  // Gunakan URL absolut agar bisa dipanggil dari Server Component
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/siswa/${encodeURIComponent(id)}`, {
      // Revalidate setiap 60 detik — profil jarang berubah
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch (err) {
    console.error("[siswa/[id]] fetchStudentProfile error:", err)
    // Kembalikan null agar halaman menampilkan pesan error, bukan crash
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default async function StudentProfilePage({ params }: Props) {
  const { id } = await params
  const data = await fetchStudentProfile(id)

  // ── 404: siswa tidak ada di DB ──────────────────────────────────────────────
  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-[#FBF9F6] border border-ink-200 rounded-3xl p-8 sm:p-10 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-white border border-ink-200 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">
              Data Siswa Tidak Ditemukan
            </h1>
            <p className="mt-3 text-sm text-ink-600 leading-relaxed">
              Siswa dengan identitas &ldquo;{id}&rdquo; tidak terdaftar pada direktori resmi
              Kandaga SMKN 13 Bandung.
            </p>
            <Link
              href="/galeri-karya"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1A2F] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#6B1424] transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Galeri Karya
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const { student, projects } = data
  const avatar = student.photoUrl ?? "/images/preview-rpl.jpg"

  // ── Profil publik lengkap ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">

        {/* ── Breadcrumb ── */}
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
              <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <Link href="/galeri-karya" className="hover:text-ink transition-colors">Galeri Karya</Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <span className="font-semibold text-ink">{student.name}</span>
            </nav>
            <Link
              href="/galeri-karya"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-700 hover:text-[#8B1A2F] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Galeri
            </Link>
          </div>
        </div>

        {/* ── Profile Header ── */}
        <section className="border-b border-ink-150 bg-gradient-to-b from-[#FBF9F6] to-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">

              {/* Left: Avatar & Identity */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl shrink-0 bg-ink-100">
                  <Image
                    src={avatar}
                    alt={student.name}
                    fill
                    priority
                    sizes="128px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B1A2F]/10 text-[#8B1A2F] border border-[#8B1A2F]/20">
                      {student.majorName}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Siswa Terverifikasi
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-ink-100 text-ink-700">
                      Kelas {student.class}
                    </span>
                  </div>

                  <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    {student.name}
                  </h1>

                  <p className="mt-2 text-sm sm:text-base text-ink-600 font-medium">
                    Angkatan {student.generation} &bull; NIS: {student.nis} &bull; SMKN 13 Bandung
                  </p>

                  {student.currentCareer && (
                    <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-ink-700 font-medium">
                      <Briefcase className="w-4 h-4 text-[#8B1A2F] shrink-0" />
                      {student.currentCareer}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Contact via BKK */}
              <div className="shrink-0 self-start md:self-center">
                <a
                  href="#footer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-ink-100 hover:bg-ink-150 text-ink-800 text-xs sm:text-sm font-bold transition border border-ink-200"
                >
                  <Building2 className="w-4 h-4 text-ink-600" />
                  Hubungi BKK Sekolah
                </a>
              </div>
            </div>

            {/* Bio */}
            {student.bio && (
              <div className="mt-8 pt-8 border-t border-ink-150 max-w-[65ch]">
                <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase mb-2">
                  TENTANG SISWA
                </h2>
                <p className="text-base text-ink-700 leading-relaxed">{student.bio}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Projects Section ── */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#8B1A2F] uppercase">
                KATALOG KARYA
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
                Portofolio Karya di Kandaga
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-ink-600">
              {projects.length} Proyek Terdokumentasi
            </p>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-ink-150 bg-[#FBF9F6] text-center max-w-md mx-auto">
              <GraduationCap className="w-8 h-8 text-ink-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-ink">Belum ada karya yang diunggah</p>
              <p className="mt-1 text-xs text-ink-600">
                Siswa ini sedang dalam proses pengerjaan karya tugas akhir.
              </p>
            </div>
          )}

          {/* Recruiter callout */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-[#FBF9F6] to-white border border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-ink">
                Tertarik Merekrut atau Berkolaborasi dengan Siswa Ini?
              </h3>
              <p className="text-sm text-ink-600 max-w-[65ch]">
                Kandaga memfasilitasi komunikasi resmi antara mitra industri dengan siswa melalui
                Bursa Kerja Khusus (BKK) SMKN 13 Bandung.
              </p>
            </div>
            <Link
              href="/#footer"
              className="shrink-0 px-6 py-3 rounded-full bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8B1A2F]/20 transition"
            >
              Hubungi BKK Sekolah
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
