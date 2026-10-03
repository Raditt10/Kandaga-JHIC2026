"use client";

import React, { useState } from "react"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ClipboardCheck,
  Users,
  History,
  Search,
  ExternalLink,
  Award,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  FileCode,
  FlaskConical,
  Wifi,
  Filter
} from "lucide-react";

// Mock Antrean Verifikasi Karya Siswa
const initialCurationQueue = [
  {
    id: "q-1",
    title: "Formulasi Indikator Asam-Basa Antosianin Alami",
    studentName: "Fathia Zahra & Tim Riset",
    classRoom: "XIII Analis Kimia 2",
    major: "Analis Kimia",
    category: "Riset Laboratorium ISO 17025",
    submittedAt: "26 Sep 2026",
    summary: "Ekstraksi pigmen bunga telang dan kubis ungu terstandarisasi spektrofotometri sebagai alternatif ramah lingkungan indikator titrasi asam-basa.",
    techStack: ["Spektrofotometri UV-Vis", "Ekstraksi Pelarut", "Uji Presisi"],
    status: "pending",
  },
  {
    id: "q-2",
    title: "Sistem Presensi RFID & Gate Otomatis Lab Jaringan",
    studentName: "Rian Firmansyah",
    classRoom: "XII TKJ 1",
    major: "TKJ",
    category: "IoT & Hardware Automation",
    submittedAt: "28 Sep 2026",
    summary: "Integrasi RFID scanner RC522 dengan Raspberry Pi dan relay solenoid gate laboratorium komputer.",
    techStack: ["Raspberry Pi", "Python", "RFID RC522", "PostgreSQL"],
    status: "pending",
  },
  {
    id: "q-3",
    title: "EcoSort — AI Computer Vision Pemilah Sampah Organik",
    studentName: "Daffa Alfarizi",
    classRoom: "XII RPL 2",
    major: "RPL",
    category: "Artificial Intelligence & Web App",
    submittedAt: "29 Sep 2026",
    summary: "Klasifikasi citra sampah organik dan anorganik secara real-time via kamera webcam menggunakan model TensorFlow.js.",
    techStack: ["TensorFlow.js", "Next.js", "WebRTC", "Tailwind CSS"],
    status: "pending",
  },
]

// Mock Riwayat Karya yang Telah Disetujui
const verifiedHistory = [
  {
    id: "h-1",
    title: "EduClass — LMS & Presensi QR Cerdas",
    studentName: "Ahmad Rizky & Tim",
    major: "RPL",
    verifiedAt: "22 Sep 2026",
    score: 95,
    notes: "Arsitektur kode sangat bersih, dokumentasi API lengkap dan aman.",
  },
  {
    id: "h-2",
    title: "Smart Green Energy Microcontroller IoT",
    studentName: "Bagus Setiawan",
    major: "TKJ",
    verifiedAt: "15 Sep 2026",
    score: 92,
    notes: "Pengujian telemetri MQTT stabil pada pengujian stres jaringan.",
  },
  {
    id: "h-3",
    title: "Kandaga Asset Hub — Inventory Jaringan Sekolah",
    studentName: "Gilang Ramadhan",
    major: "TKJ",
    verifiedAt: "12 Agu 2026",
    score: 89,
    notes: "UI responsif dan barcode scanner berjalan lancar di perangkat mobile.",
  },
]

export default function TeacherDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [curationQueue, setCurationQueue] = useState(initialCurationQueue)
  const [searchQuery, setSearchQuery] = useState("")

  // State penilaian
  const handleApprove = (id: string) => {
    setCurationQueue(curationQueue.filter((item) => item.id !== id))
    alert("Karya berhasil disetujui! Status proyek kini Terverifikasi Sekolah dan ditayangkan ke Galeri Utama Kandaga.")
  }

  const handleRevision = (id: string) => {
    setCurationQueue(curationQueue.filter((item) => item.id !== id))
    alert("Catatan revisi telah dikirimkan ke akun siswa.")
  }

  const teacherTabs: DashboardTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "antrean",
      label: "Antrean Verifikasi",
      icon: ClipboardCheck,
      badge: `${curationQueue.length}`,
    },
    {
      id: "siswa-bimbingan",
      label: "Siswa Bimbingan",
      icon: Users,
    },
    {
      id: "riwayat",
      label: "Riwayat Kurasi",
      icon: History,
      badge: `${verifiedHistory.length}`,
    },
  ]

  return (
    <DashboardLayout
      roleTitle="Guru Kurator"
      roleSlug="teacher"
      icon={BookOpen}
      tabs={teacherTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ──────────────── TAB 1: DASHBOARD GURU ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-semibold mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Portal Penilaian & Pembimbingan Karya Siswa</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Selamat Bertugas, {session?.user?.username || "Bapak/Ibu Guru"}! 👨‍🏫
              </h1>
              <p className="font-sans text-amber-100 text-sm max-w-[65ch] mt-2 leading-relaxed">
                Sebagai Guru Pembimbing, Anda memverifikasi kelayakan karya siswa, memberikan penilaian standar ISO/BNSP, dan menyetujui penayangan portofolio di galeri utama Kandaga.
              </p>

              {/* User Session Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-amber-200 block text-xs font-medium">NIP / Username Guru</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{session?.user?.username || "guru.pembimbing"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-amber-200 block text-xs font-medium">Email Akademik</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">{session?.user?.email || "guru@smkn13bandung.sch.id"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-amber-200 block text-xs font-medium">Otoritas Kurasi</span>
                  <span className="font-bold text-amber-300 text-sm mt-0.5 block">VERIFIKATOR SEKOLAH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Antrean Verifikasi Pending</h2>
              <p className="font-heading text-3xl font-extrabold text-amber-600 mt-2">{curationQueue.length} Proyek</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 block">Menunggu kurasi dan review Anda</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Disetujui Publikasi</h2>
              <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">28 Proyek</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 block">Telah tayang di Galeri Utama Kandaga</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rata-Rata Nilai Riset</h2>
              <p className="font-heading text-3xl font-extrabold text-blue-600 mt-2">91.8 / 100</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 block">Standar kelayakan mutu SMKN 13</span>
            </div>
          </div>

          {/* Quick Preview Antrean */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-900">Perlu Verifikasi Segera</h2>
                <p className="text-xs text-zinc-500 max-w-[65ch]">Karya yang baru diajukan oleh siswa dan memerlukan validasi materi tugas akhir.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("antrean")}
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Antrean ({curationQueue.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {curationQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {item.major}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{item.classRoom}</span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-zinc-900">{item.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium">Diajukan oleh: {item.studentName}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevision(item.id)}
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Revisi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: ANTREAN VERIFIKASI ──────────────── */}
      {activeTab === "antrean" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Antrean Penilaian & Kurasi Karya Siswa
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Tinjau kelayakan metodologi riset, kualitas implementasi kode, dan dokumentasi karya sebelum diberikan hak tayang di galeri publik.
            </p>
          </div>

          <div className="space-y-4">
            {curationQueue.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-heading text-base font-bold text-zinc-800">Semua Antrean Selesai</h3>
                <p className="text-xs text-zinc-500 mt-1">Tidak ada karya yang menunggu review saat ini.</p>
              </div>
            ) : (
              curationQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {item.major}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">{item.category}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-400">Diajukan: {item.submittedAt}</span>
                      </div>
                      <h2 className="font-heading text-lg font-bold text-zinc-900 pt-1">{item.title}</h2>
                      <p className="text-xs text-zinc-600">
                        Oleh: <strong>{item.studentName}</strong> ({item.classRoom})
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Menunggu Penilaian</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-[65ch]">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {item.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-zinc-500">Standar Rubrik: ISO 9001 / BNSP SMKN 13</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevision(item.id)}
                        className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Minta Revisi Siswa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui & Publikasikan (90+)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: SISWA BIMBINGAN ──────────────── */}
      {activeTab === "siswa-bimbingan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Daftar Siswa Bimbingan Tugas Akhir
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Monitoring progres portofolio dan kelayakan karya siswa bimbingan akademik Anda.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Nama Siswa</th>
                  <th className="pb-3 px-3">Kelas / Jurusan</th>
                  <th className="pb-3 px-3">Judul Proyek Tugas Akhir</th>
                  <th className="pb-3 px-3">Status Kurasi</th>
                  <th className="pb-3 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { name: "Ahmad Rizky Pratama", class: "XII RPL 1", project: "EduClass — LMS & Presensi QR", status: "Selesai (Nilai: 95)" },
                  { name: "Bagus Setiawan", class: "XII TKJ 2", project: "Smart Green Energy IoT", status: "Selesai (Nilai: 92)" },
                  { name: "Fathia Zahra", class: "XIII Analis Kimia 2", project: "Formulasi Indikator Asam-Basa", status: "Dalam Review" },
                  { name: "Daffa Alfarizi", class: "XII RPL 2", project: "EcoSort — AI Computer Vision", status: "Dalam Review" },
                  { name: "Siti Rahmawati", class: "XII RPL 1", project: "Portal Alumni Tracer Study BKK", status: "Penyusunan Draf" },
                ].map((s, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition">
                    <td className="py-3 px-3 font-bold text-zinc-900">{s.name}</td>
                    <td className="py-3 px-3 text-zinc-600 font-mono">{s.class}</td>
                    <td className="py-3 px-3 text-zinc-800">{s.project}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 rounded-md font-semibold text-[11px]">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button className="text-amber-700 font-bold hover:underline cursor-pointer">
                        Buka Log Bimbingan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: RIWAYAT KURASI ──────────────── */}
      {activeTab === "riwayat" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Riwayat Karya yang Telah Disetujui
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Arsip karya portofolio siswa yang telah Anda setujui dan berhasil dipublikasikan di Galeri Utama Kandaga.
            </p>
          </div>

          <div className="space-y-3">
            {verifiedHistory.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Disetujui: {item.verifiedAt}
                    </span>
                    <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                      {item.major}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-zinc-900">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Siswa: {item.studentName} • Nilai: <strong className="text-emerald-700">{item.score} / 100</strong></p>
                  <p className="text-xs text-zinc-600 mt-1 italic">&ldquo;{item.notes}&rdquo;</p>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full self-start sm:self-center shrink-0">
                  Tayang di Galeri
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
