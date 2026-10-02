"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProjectCard from "@/components/gallery/ProjectCard";
import {
  getStudentById,
  getProjectsByStudentId,
} from "@/data/galleryData";
import {
  Lock,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Mail,
  Building2,
  ChevronRight,
  Briefcase,
} from "lucide-react";

interface StudentProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const resolvedParams = use(params);
  const student = getStudentById(resolvedParams.id);

  // If student doesn't exist in records
  if (!student) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-[#FBF9F6] border border-ink-200 rounded-3xl p-8 sm:p-10 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-white border border-ink-200 flex items-center justify-center text-ink-400 mx-auto mb-5 shadow-xs">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">
              Data Siswa Tidak Ditemukan
            </h1>
            <p className="mt-3 text-sm text-ink-600 leading-relaxed max-w-[65ch]">
              Data siswa dengan identitas &ldquo;{resolvedParams.id}&rdquo; tidak terdaftar pada direktori resmi Kandaga SMKN 13 Bandung.
            </p>
            <Link
              href="/gallery"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1A2F] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#6B1424] transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Galeri Karya</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const studentProjects = getProjectsByStudentId(student.id);

  /* ──────────────────────────────────────────────────────────
   * KONDISI 1: PROFIL SISWA DIPRIVAT (isPrivate === true)
   * Tampilan resmi proteksi privasi siswa SMKN 13 Bandung
   * ────────────────────────────────────────────────────────── */
  if (student.isPrivate) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        <main className="flex-1 pt-24 pb-24 flex flex-col justify-center">
          {/* Breadcrumb Bar */}
          <div className="border-b border-ink-150 bg-[#FBF9F6] mb-8">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
                <Link href="/" className="hover:text-ink transition-colors">
                  Beranda
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                <Link href="/gallery" className="hover:text-ink transition-colors">
                  Galeri Karya
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                <span className="font-semibold text-ink">Profil Siswa (Privat)</span>
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

          <div className="mx-auto max-w-2xl px-6 w-full py-8">
            {/* The Prestigious Privacy Card */}
            <div className="bg-white rounded-3xl border border-ink-200 shadow-xl overflow-hidden text-center relative">
              {/* Subtle decorative top accent bar */}
              <div className="h-2.5 w-full bg-gradient-to-r from-amber-500 via-[#8B1A2F] to-[#6B1424]" />

              <div className="p-8 sm:p-12">
                {/* Lock Emblem with Radiant Background */}
                <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-200/50 to-[#8B1A2F]/15 blur-lg" />
                  <div className="relative w-20 h-20 rounded-full bg-[#FBF9F6] border-2 border-amber-300/80 flex items-center justify-center text-[#8B1A2F] shadow-sm">
                    <Lock className="w-9 h-9 text-[#8B1A2F]" />
                  </div>
                </div>

                {/* Subtitle pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>KEBIJAKAN PRIVASI SISWA</span>
                </div>

                {/* Main Heading 1 */}
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  Profil Siswa Bersifat Privat
                </h1>

                {/* Description of Privacy */}
                <p className="mt-4 text-base text-ink-700 leading-relaxed max-w-[60ch] mx-auto">
                  Siswa ini memilih untuk tidak mempublikasikan identitas lengkap, informasi kontak, dan data akademik ke publik sesuai dengan preferensi perlindungan data pribadi SMKN 13 Bandung.
                </p>

                {/* Specific reason box if available */}
                <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 text-left leading-relaxed flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-900">Catatan Sistem:</span>
                    <span>
                      {student.privacyReason || "Pemilik akun membatasi visibilitas profil pribadi untuk publik."}
                    </span>
                  </div>
                </div>

                {/* Reassurance Info Card */}
                <div className="mt-5 p-4 rounded-2xl bg-[#FBF9F6] border border-ink-150 text-xs text-ink-600 text-left leading-relaxed">
                  <p className="font-bold text-ink mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Karya Tetap Terverifikasi Sekolah</span>
                  </p>
                  <p>
                    Meskipun profil personal siswa berstatus privat, karya proyek yang telah dipublikasikan di etalase ini tetap merupakan hasil karya resmi yang telah lulus verifikasi dan kurasi guru pembimbing.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-ink-150 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/gallery"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8B1A2F]/20 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Galeri Karya</span>
                  </Link>

                  <a
                    href="#footer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink-100 hover:bg-ink-150 text-ink-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-ink-200"
                  >
                    <Building2 className="w-4 h-4 text-ink-600" />
                    <span>Hubungi BKK Sekolah</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
   * KONDISI 2: PROFIL SISWA PUBLIK (isPrivate === false)
   * Tampilan portofolio lengkap & karya siswa
   * ────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Breadcrumb Bar */}
        <div className="border-b border-ink-150 bg-[#FBF9F6]">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-ink-600">
              <Link href="/" className="hover:text-ink transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <Link href="/gallery" className="hover:text-ink transition-colors">
                Galeri Karya
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
              <span className="font-semibold text-ink">{student.name}</span>
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

        {/* ── Student Profile Header Banner ── */}
        <section className="border-b border-ink-150 bg-gradient-to-b from-[#FBF9F6] to-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              {/* Left: Avatar & Identity */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl shrink-0 bg-ink-100">
                  <Image
                    src={student.avatar}
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
                      <span>Siswa Terverifikasi</span>
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
                      <span>{student.currentCareer}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Contact & Action Links */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 self-start md:self-center">
                {student.contactEmail && (
                  <a
                    href={`mailto:${student.contactEmail}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8B1A2F]/20 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Kirim Email Resmi</span>
                  </a>
                )}

                <div className="flex items-center gap-2">
                  {student.socialLinks?.github && (
                    <a
                      href={student.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full border border-ink-200 bg-white hover:border-ink text-ink-700 hover:text-ink transition-colors"
                      aria-label="GitHub Siswa"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                  )}
                  {student.socialLinks?.linkedin && (
                    <a
                      href={student.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full border border-ink-200 bg-white hover:border-ink text-ink-700 hover:text-ink transition-colors"
                      aria-label="LinkedIn Siswa"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                    </a>
                  )}
                  {student.socialLinks?.website && (
                    <a
                      href={student.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full border border-ink-200 bg-white hover:border-ink text-ink-700 hover:text-ink transition-colors"
                      aria-label="Website Portofolio Siswa"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8 pt-8 border-t border-ink-150 max-w-[65ch]">
              <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase mb-2">
                TENTANG SISWA
              </h2>
              <p className="text-base text-ink-700 leading-relaxed">
                {student.bio}
              </p>
            </div>

            {/* Skills & Tools */}
            <div className="mt-6 pt-6 border-t border-ink-150">
              <h2 className="text-xs font-semibold tracking-wider text-ink-500 uppercase mb-3">
                KEAHLIAN &amp; KOMPETENSI
              </h2>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl bg-white border border-ink-200 text-xs sm:text-sm font-semibold text-ink-800 shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Student Projects Section ── */}
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
              {studentProjects.length} Proyek Terdokumentasi
            </p>
          </div>

          {studentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {studentProjects.map((project) => (
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

          {/* Recruiter / Industry Callout */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-[#FBF9F6] to-white border border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-ink">
                Tertarik Merekrut atau Berkolaborasi dengan Siswa Ini?
              </h3>
              <p className="text-sm text-ink-600 max-w-[65ch]">
                Kandaga memfasilitasi komunikasi resmi antara mitra industri dengan siswa melalui Bursa Kerja Khusus (BKK) SMKN 13 Bandung.
              </p>
            </div>
            <Link
              href="/#footer"
              className="shrink-0 px-6 py-3 rounded-full bg-[#8B1A2F] hover:bg-[#6B1424] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8B1A2F]/20 transition-all cursor-pointer"
            >
              Hubungi BKK Sekolah
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
