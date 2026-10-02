"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  Sparkles,
  Upload,
  CheckCircle2,
  Award,
  FileCode,
  FlaskConical,
  Wifi,
  ArrowRight,
  ShieldCheck,
  Eye,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const studentName = session?.user?.username || session?.user?.name || "Siswa Kandaga";

  return (
    <DashboardLayout
      roleTitle="Siswa"
      roleSlug="student"
      icon={GraduationCap}
      pageTitle="Ringkasan"
    >
      {/* ── Welcome Banner (Restrained Kandaga Aesthetic) ── */}
      <section aria-labelledby="student-welcome-heading" className="mb-8 rounded-3xl bg-primary text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Katalog Karya Terkurasi SMKN 13 Bandung</span>
          </div>

          <h1 id="student-welcome-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Selamat Datang, {studentName}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Peti penyimpanan karya digital Anda. Kelola portofolio tugas akhir, pantau proses kurasi oleh guru pembimbing kompetensi keahlian, dan lihat minat dari mitra industri sekolah.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/student/create-project"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-ink font-heading font-bold text-xs hover:bg-[#dfbe6d] transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Unggah Karya Baru</span>
            </Link>
            <Link
              href="/student/my-projects"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-xs border border-white/20 transition-colors"
            >
              <span>Kelola Seluruh Karya</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Core Action & Curation Guidance Cards ── */}
      <section aria-labelledby="student-actions-heading" className="mb-8">
        <h2 id="student-actions-heading" className="sr-only">
          Status Portofolio Siswa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Unggah & Publikasi */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Upload className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-base font-bold text-ink">
                Unggah Karya Baru
              </h2>
              <p className="text-xs text-ink-600 mt-2 leading-relaxed">
                Publikasikan modul laboratorium Analis Kimia, repositori perangkat lunak RPL, atau arsitektur jaringan IoT TKJ.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-ink-150">
              <Link
                href="/student/create-project"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
              >
                <span>Buka Formulir Unggah</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Card 2: Kurasi Guru Pembimbing */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-base font-bold text-ink">
                Kurasi Guru Pembimbing
              </h2>
              <p className="text-xs text-ink-600 mt-2 leading-relaxed">
                Karya ditinjau oleh guru keahlian untuk memastikan standar mutu, orisinalitas riset, dan kelayakan pameran publik.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-ink-150 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                2 Terverifikasi Guru
              </span>
              <span className="text-xs text-ink-600">1 Dalam Antrean</span>
            </div>
          </div>

          {/* Card 3: Minat Industri (Via BKK) */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-base font-bold text-ink">
                Minat Industri (Via BKK)
              </h2>
              <p className="text-xs text-ink-600 mt-2 leading-relaxed">
                Setiap apresiasi atau tawaran magang dari mitra DUDI disaring dan dikoordinasikan secara aman lewat BKK sekolah.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-ink-150 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                5 Kunjungan Industri
              </span>
              <span className="text-xs text-ink-600">Terpantau BKK</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Panduan Badge Kurasi Kandaga (4 Tier Sesuai AGENTS.md) ── */}
      <section aria-labelledby="badge-guide-heading" className="mb-8 rounded-2xl border border-ink-150 bg-cream/50 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 id="badge-guide-heading" className="font-heading text-sm font-bold text-ink">
              Tingkatan Apresiasi Karya Kandaga
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Empat tier apresiasi resmi yang disematkan oleh kurator kejuruan dan Koordinator BKK.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">Standar Mutu SMKN 13</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              tier: "Karya Terpilih",
              giver: "Guru Pembimbing",
              desc: "Memenuhi kelayakan teknis kejuruan dasar.",
              badgeBg: "bg-white text-ink border-ink-150",
            },
            {
              tier: "Karya Unggulan",
              giver: "Tim Kurasi Jurusan",
              desc: "Inovatif, dokumentasi lengkap & berdampak.",
              badgeBg: "bg-rose-50 text-primary border-primary/20",
            },
            {
              tier: "Karya Juara Lomba",
              giver: "Sekolah / LKS",
              desc: "Prestasi lomba tingkat kota hingga nasional.",
              badgeBg: "bg-amber-50 text-amber-900 border-amber-300",
            },
            {
              tier: "Diminati Industri",
              giver: "Hanya Koordinator BKK",
              desc: "Diverifikasi siap diserap dunia kerja / DUDI.",
              badgeBg: "bg-emerald-50 text-emerald-900 border-emerald-300",
            },
          ].map((item, i) => (
            <div key={i} className={`p-3.5 rounded-xl border ${item.badgeBg} bg-white shadow-2xs`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <h3 className="font-heading text-xs font-bold text-ink">{item.tier}</h3>
              </div>
              <p className="text-xs text-ink-600 leading-snug">{item.desc}</p>
              <span className="block mt-2 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                Oleh: {item.giver}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Karya Terkini Siswa ── */}
      <section aria-labelledby="recent-projects-heading" className="rounded-2xl border border-ink-150 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-ink-150">
          <div>
            <h2 id="recent-projects-heading" className="font-heading text-base font-bold text-ink">
              Portofolio Dipublikasikan
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Daftar karya Anda yang telah melalui proses kurasi awal.
            </p>
          </div>
          <Link
            href="/student/my-projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <span>Buka Manajer Proyek Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="divide-y divide-ink-150">
          {[
            {
              title: "EduClass — LMS & Presensi QR Cerdas",
              major: "Rekayasa Perangkat Lunak",
              icon: FileCode,
              views: "1.240",
              status: "Terpublikasi Galeri",
              statusBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
            },
            {
              title: "Smart Green Energy Microcontroller IoT",
              major: "Teknik Komputer Jaringan",
              icon: Wifi,
              views: "890",
              status: "Terpublikasi Galeri",
              statusBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
            },
            {
              title: "Formulasi Indikator Asam-Basa Antosianin Alami",
              major: "Analis Kimia",
              icon: FlaskConical,
              views: "450",
              status: "Review Guru Pembimbing",
              statusBg: "bg-amber-50 text-amber-800 border-amber-200",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cream/40 px-3 -mx-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cream border border-ink-150 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-ink">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-ink-600 mt-0.5">
                      {item.major}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-ink-600 font-mono">
                    <Eye className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />
                    <span>{item.views} tayangan</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${item.statusBg}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
}
