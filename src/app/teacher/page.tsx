"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw,
  FileCheck2,
} from "lucide-react";

interface QueueItem {
  id: string;
  project: string;
  student: string;
  major: string;
  majorBadge: string;
  rubricScore: string;
  submittedAt: string;
  status: "pending" | "approved" | "revision";
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "q-1",
    project: "Formulasi Indikator Asam-Basa Antosianin Alami Kulit Buah",
    student: "Siti Rahma & Tim Laboratorium",
    major: "Analis Kimia",
    majorBadge: "bg-emerald-50 text-emerald-900 border-emerald-300",
    rubricScore: "Kelayakan Riset: 92/100",
    submittedAt: "2 jam yang lalu",
    status: "pending",
  },
  {
    id: "q-2",
    project: "EcoSync — Smart IoT Monitoring Energi Surya Berbasis ESP32",
    student: "Rifqi Ahmad & Tim Jaringan",
    major: "Teknik Komputer Jaringan",
    majorBadge: "bg-blue-50 text-blue-900 border-blue-200",
    rubricScore: "Infrastruktur Jaringan: 95/100",
    submittedAt: "1 hari yang lalu",
    status: "pending",
  },
  {
    id: "q-3",
    project: "EduClass — Sistem Presensi QR Cerdas & Validasi Geolocation",
    student: "Farhan Maulana & Tim RPL",
    major: "Rekayasa Perangkat Lunak",
    majorBadge: "bg-rose-50 text-primary border-primary/20",
    rubricScore: "Arsitektur Kode: 94/100",
    submittedAt: "2 hari yang lalu",
    status: "pending",
  },
];

export default function TeacherDashboardPage() {
  const { data: session } = useSession();
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const teacherName = session?.user?.username || session?.user?.name || "Bapak/Ibu Guru";

  const handleApprove = (id: string, projectName: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item))
    );
    setActionFeedback(`Karya "${projectName}" disetujui dan diterbitkan ke Galeri Utama Kandaga.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleRevision = (id: string, projectName: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "revision" as const } : item))
    );
    setActionFeedback(`Catatan revisi untuk "${projectName}" telah dikirimkan ke siswa terkait.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const pendingCount = queue.filter((item) => item.status === "pending").length;
  const approvedCount = 28 + queue.filter((item) => item.status === "approved").length;

  return (
    <DashboardLayout
      roleTitle="Guru Kurator"
      roleSlug="teacher"
      icon={BookOpen}
      pageTitle="Kurasi Karya"
    >
      {/* ── Welcome Banner (Kandaga Teacher & Mentorship) ── */}
      <section aria-labelledby="teacher-welcome-heading" className="mb-8 rounded-3xl bg-primary text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Panel Kurasi & Validasi Mutu Kejuruan SMKN 13</span>
          </div>

          <h1 id="teacher-welcome-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Selamat Bertugas, {teacherName}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Sebagai Kurator dan Guru Pembimbing, peran Anda adalah menyaring dan memastikan orisinalitas riset, kelayakan metodologi, serta etika publikasi karya siswa sebelum tampil di etalase industri.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/90">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Otoritas Kurasi: <strong>Tier Karya Terpilih, Karya Unggulan, Juara Lomba</strong></span>
            </div>
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Standar Mutu ISO 9001:2015 SMKN 13</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Action Feedback Toast / Alert ── */}
      {actionFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          <p className="font-medium">{actionFeedback}</p>
        </div>
      )}

      {/* ── Key Assessment Metrics ── */}
      <section aria-labelledby="teacher-metrics-heading" className="mb-8">
        <h2 id="teacher-metrics-heading" className="sr-only">
          Statistik Penilaian Kurasi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Antrean Menunggu */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Menunggu Kurasi Guru</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-amber-900">{pendingCount} Karya</p>
            <p className="text-xs text-ink-600 mt-1">Perlu tinjauan kelayakan teknis</p>
          </div>

          {/* Telah Disetujui */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Disetujui ke Galeri</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-emerald-900">{approvedCount} Karya</p>
            <p className="text-xs text-ink-600 mt-1">Tayang di etalase publik Kandaga</p>
          </div>

          {/* Standar Mutu ISO */}
          <div className="rounded-2xl border border-ink-150 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Rerata Kualitas Karya</span>
              <div className="w-9 h-9 rounded-xl bg-cream text-primary flex items-center justify-center">
                <Award className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-3xl font-extrabold text-ink">93.2 / 100</p>
            <p className="text-xs text-ink-600 mt-1">Indeks kepatuhan rubrik kejuruan</p>
          </div>
        </div>
      </section>

      {/* ── Antrean Kurasi Karya Siswa ── */}
      <section aria-labelledby="curation-queue-heading" className="rounded-2xl border border-ink-150 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-ink-150">
          <div>
            <h2 id="curation-queue-heading" className="font-heading text-base font-bold text-ink">
              Antrean Penilaian & Verifikasi Karya
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Tinjau karya siswa, berikan persetujuan untuk tayang di galeri, atau kembalikan catatan perbaikan.
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-600 font-mono">
            {pendingCount} dari {queue.length} belum diverifikasi
          </span>
        </div>

        <div className="divide-y divide-ink-150">
          {queue.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-cream/30 px-3 -mx-3 rounded-xl transition-colors"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.majorBadge}`}>
                    {item.major}
                  </span>
                  <span className="text-xs text-ink-500 font-mono">· Diajukan {item.submittedAt}</span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {item.rubricScore}
                  </span>
                </div>

                <h3 className="font-heading text-sm sm:text-base font-bold text-ink leading-snug">
                  {item.project}
                </h3>
                <p className="text-xs text-ink-600 mt-1">
                  Pengembang / Tim Peneliti: <strong className="text-ink font-semibold">{item.student}</strong>
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                {item.status === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Telah Disetujui</span>
                  </span>
                ) : item.status === "revision" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-300">
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Menunggu Revisi Siswa</span>
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id, item.project)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white font-heading font-semibold text-xs hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
                      aria-label={`Setujui publikasi ${item.project}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                      <span>Setujui Publikasi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevision(item.id, item.project)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-ink-700 font-heading font-semibold text-xs border border-ink-150 hover:bg-cream hover:text-ink transition-colors cursor-pointer"
                      aria-label={`Minta revisi untuk ${item.project}`}
                    >
                      <span>Minta Revisi</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
