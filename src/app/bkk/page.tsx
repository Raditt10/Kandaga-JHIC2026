"use client";

/**
 * /bkk — Dashboard utama Koordinator BKK.
 *
 * Heading outline:
 *   h1: "Dashboard BKK"
 *     h2: judul tiap widget
 *
 * Fase 1: hanya 1 widget angka "X akun menunggu verifikasi" + info ringkas.
 * Halaman antrian (list) dikerjakan di Fase 2.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BKKLayout from "@/components/bkk/BKKLayout";
import { useSession } from "next-auth/react";
import { ShieldCheck, MessageSquare, Building2, ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";

export default function BKKDashboardPage() {
  const { data: session } = useSession();
  const [menunggu, setMenunggu]           = useState<number | null>(null);
  const [antrianKontak, setAntrianKontak] = useState<number | null>(null);
  const [mitra, setMitra]                 = useState<number | null>(null);
  const [loading, setLoading]             = useState(true);

  // Ketiga widget dibaca dari database sekaligus. Sebelumnya widget "Antrian
  // Kontak" dan "Mitra Terdaftar" hanya menampilkan tanda "—" hardcoded,
  // padahal API-nya sudah tersedia.
  useEffect(() => {
    Promise.all([
      fetch("/api/bkk/verifikasi?count=true").then((r) => r.json()).catch(() => ({})),
      // status "aktif" = permintaan yang masih menunggu tindakan BKK
      fetch("/api/bkk/kontak?status=aktif&count=true").then((r) => r.json()).catch(() => ({})),
      fetch("/api/bkk/mitra").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([v, k, m]) => {
        setMenunggu(v.count ?? 0);
        setAntrianKontak(k.count ?? 0);
        setMitra(m.summary?.semua ?? (Array.isArray(m.companies) ? m.companies.length : 0));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <BKKLayout>
      {/* Welcome */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-primary-dark to-primary text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-primary/15">
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 max-w-xl pr-28 sm:pr-40 md:pr-0">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard BKK, {session?.user?.name ?? "Koordinator"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-rose-100 leading-relaxed opacity-90 max-w-[60ch]">
            Pantau dan proses pengajuan akun mitra perusahaan, serta tinjau permintaan
            kontak yang masuk dari perusahaan ke siswa.
          </p>
        </div>

        {/* Model Chibi Koordinator BKK */}
        <div className="absolute right-1 sm:right-6 md:right-8 lg:right-12 -top-2 sm:-top-3 md:-top-4 w-36 sm:w-48 md:w-56 lg:w-64 h-48 sm:h-60 md:h-68 lg:h-76 pointer-events-none select-none z-10">
          <div className="relative w-full h-full">
            <Image
              src="/images/bkk.webp"
              alt="Ilustrasi Koordinator BKK"
              fill
              sizes="(max-width: 640px) 144px, (max-width: 768px) 200px, 260px"
              priority
              className="object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Widget 1: akun menunggu verifikasi */}
        <Link
          href="/bkk/verifikasi"
          className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (menunggu ?? 0)}
            </span>
            <span className="text-xs font-bold text-ink-700 block mt-1">Menunggu Verifikasi</span>
            <span className="text-[11px] text-ink-400 block mt-0.5">
              {menunggu === 0 ? "Tidak ada pengajuan baru" : `${menunggu ?? 0} perusahaan perlu ditinjau`}
            </span>
          </div>
        </Link>

        {/* Widget 2: Antrian Kontak */}
        <Link
          href="/bkk/kontak"
          className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <MessageSquare className="w-5 h-5 text-primary" />
            <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (antrianKontak ?? 0)}
            </span>
            <span className="text-xs font-bold text-ink-700 block mt-1">Antrean Kontak</span>
            <span className="text-[11px] text-ink-400 block mt-0.5">
              Permintaan minat rekrutmen dari perusahaan ke siswa
            </span>
          </div>
        </Link>

        {/* Widget 3: Mitra Terdaftar */}
        <Link
          href="/bkk/mitra"
          className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Building2 className="w-5 h-5 text-primary" />
            <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-ink-300" /> : (mitra ?? 0)}
            </span>
            <span className="text-xs font-bold text-ink-700 block mt-1">Mitra Terdaftar</span>
            <span className="text-[11px] text-ink-400 block mt-0.5">
              Seluruh perusahaan yang sudah pernah mendaftar
            </span>
          </div>
        </Link>
      </div>

      {/* Info alur */}
      <div className="rounded-2xl border border-ink-150 bg-white p-5">
        <h2 className="font-heading text-sm font-semibold text-ink mb-3">
          Alur Kerja BKK
        </h2>
        <ol className="space-y-2">
          {[
            "Perusahaan mendaftar → masuk antrian Verifikasi Akun.",
            "BKK tinjau dan setujui atau tolak (wajib sertakan catatan jika menolak).",
            "Perusahaan yang disetujui dapat mengajukan minat kontak ke karya siswa.",
            "BKK tinjau permintaan kontak → teruskan ke siswa atau tolak.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </BKKLayout>
  );
}
